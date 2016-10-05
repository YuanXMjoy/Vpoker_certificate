#coding=utf-8
from django.shortcuts import render
from django.http import JsonResponse,HttpResponse,HttpResponseRedirect
from django.contrib.auth import authenticate,login,logout
from . import verification_code
from .models import certificate_data
from .forms import certificate_form
from django.http import StreamingHttpResponse
import json
from django.template.context_processors import csrf

import os,sys

pagesize = 10

#sys.path.append("..")
#from Certificate_verification.settings import MEDIA_ROOT
# Create your views here.




def res(res_code,desc,data):
    res_data = {
        'res_code':res_code,
        'desc':desc,
    }
    if data:
        res_data['data'] = data;
#    print(res_data) 
    return JsonResponse(res_data)

def res_fail(res_code,desc,data = None):
    return res(res_code,desc,data)

def res_success(desc,data = None):
    return res(0,desc,data)




#获取证书图片
def get_certificate_pic(request,pk):
    des = certificate_data.objects.get(certificate_id = pk)
    return JsonResponse({"pic":"certificate/imgfiles/"+str(des.pic)})


#证书查询
def search_certificate(request):
    assert request.method == 'GET'
    #验证验证码
    imgcode  = request.GET['code']

    if imgcode is None or imgcode=='':
        return res_fail(1,"验证码不能为空")

    ca = verification_code.Captcha(request)
    if not ca.check(imgcode):
        return res_fail(1,"验证码错误")

    certificate_id = request.GET['certificate_id']    
    if certificate_id is None or certificate_id == '':
        return res_fail(1,"证书编号不能为空")

    try:
        des = certificate_data.objects.get(certificate_id=certificate_id)
    except certificate_data.DoesNotExist:
        return res_fail(1,"证书不存在！")

    return res_success("找到证书",{"id":des.id})



#返回证书图片下载流
def certificate_download(request,pk):
    try:
        des = certificate_data.objects.get(certificate_id=pk)
    except certificate_data.DoesNotExist:
        return res_fail(1,"证书不存在！")
    filename = des.pic.path
    file_download_name = str(des.certificate_id)

    def readFile(fn, buf_size=262144):
        f = open(fn, "rb")
        while True:
            c = f.read(buf_size)
            if c:
                yield c
            else:
                break
        f.close()
    
    response = HttpResponse(readFile(filename),content_type='application/octet-stream')
    response['Content-Disposition'] = 'attachment; filename=certificate-%s.jpg' %file_download_name
    
    return response


#后台登陆页面
#def login_page(request):
#    user = request.COOKIES.get('username')
    #从cookie中判断是否已经登陆，若是，直接跳转
#    if user is not None:
#        return HttpResponseRedirect('/admin/admin/')
#    else:
#        return render(request,'/certificate/login_page.html')
#后台管理页面
#def admin_page(request):
#    user = request.COOKIES.get('username')
#    if user is None:
#        return HttpResponseRedirect('/admin/login/')
#    else:
#        return render(request,'/certificate/admin_page.html')

#获取验证码
def get_code(request):
    ca = verification_code.Captcha(request)
    res = ca.display()
    dic = csrf(request)
    res.set_cookie('csrftoken',dic['csrf_token'])
    return res


#后台登入登出
def log_out(request):
    response = HttpResponse()
    response.delete_cookie('username')
    return response

def log_in(request):
    if request.method != 'POST':
        return res_fail(1,"method need to be post!")
    #验证验证码
#    print(request.POST)
    imgcode  = request.POST['code']
    if imgcode is None or imgcode=='':
        return res_fail(1,"验证码不能为空")

    ca = verification_code.Captcha(request)
    if ca.check(imgcode) is False:
        return res_fail(1,"验证码错误")
    #验证账号密码

    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username,password=password)
    if user is not None:
       # response = HttpResponse()
        #设置浏览器cookie，失效时间为3600秒
        #response.set_cookie('username',username,3600)
        return res_success("登陆成功！")
    else:
        return res_fail(1,"用户名或密码不正确")


#后台请求部分
def add_certificate(request):
#    user = request.COOKIES.get('username')
#    if user is None:
#        return res_fail(2,"未登陆")

    if request.method != 'POST':
        return res_fail(1,"method need to be post!")
    if int(request.POST['login_stats']) == 0:
        return res_fail(2,"未登陆")

    form = certificate_form(request.POST,request.FILES)
    if form.is_valid():
        #若已存在该编号证书
        flag = 0
        try:
            current = certificate_data.objects.get(certificate_id = form.cleaned_data['certificate_id'])
        except certificate_data.DoesNotExist:
            flag = 1
        #返回存在的证书的信息
        if flag!=1:
            data = {"certificate_id":current.certificate_id,
                    "vpoker_stuid"  :current.vpoker_stuid,
                    "id"            :current.id,
                    "pic"           :"certificate/imgfiles/"+str(current.pic),
            }
            return res_fail(1,"该编号证书已存在",data)

        #若不存在
        new = certificate_data(certificate_id=form.cleaned_data['certificate_id'],
            vpoker_stuid=form.cleaned_data['vpoker_stuid'],pic=form.cleaned_data['pic'])
        new.save()
        data = {"certificate_id":new.certificate_id,
                "vpoker_stuid"  :new.vpoker_stuid,
                "id"            :new.id,
                "pic"           :"certificate/imgfiles/"+str(new.pic),
        }
        return res_success("创建新证书成功",data)
    else:
        return res_fail(1,"表单信息不合法")


def edit_certificate(request):
#    user = request.COOKIES.get('username')
#    if user is None:
#        return res_fail(2,"未登陆")
#    print(request.POST)
    if request.method != 'POST':
        return res_fail(1,"method need to be post!")
#    print(request.POST)
    if int(request.POST['login_stats']) == 0:
        return res_fail(2,"未登陆")
    form = certificate_form(request.POST,request.FILES)
    certificate_id = request.POST['certificate_id']
    vpoker_stuid   = request.POST['vpoker_stuid']
#    print(certificate_id,vpoker_stuid)

    if form.is_valid():
        try:
            des = certificate_data.objects.get(certificate_id = form.cleaned_data['certificate_id'])
        except certificate_data.DoesNotExist:
            return res_fail(1,"该编号证书不存在")

        des.vpoker_stuid = form.cleaned_data['vpoker_stuid']
        #删除原来已经存在的图片
        old_path = des.pic.path
        os.remove(old_path)

        des.pic  = form.cleaned_data['pic']
        des.save()
        data = {"certificate_id":des.certificate_id,
                "vpoker_stuid"  :des.vpoker_stuid,
                "id"            :des.id,
                "pic"           :"certificate/imgfiles/"+str(des.pic),
        }
        return res_success("修改表单成功",data)

    elif certificate_id is not None and vpoker_stuid is not None:
        try:
            des = certificate_data.objects.get(certificate_id = form.cleaned_data['certificate_id'])
        except certificate_data.DoesNotExist:
            return res_fail(1,"该编号证书不存在")
        des.vpoker_stuid = form.cleaned_data['vpoker_stuid']
        des.save()

        data = {"certificate_id":des.certificate_id,
                "vpoker_stuid"  :des.vpoker_stuid,
                "id"            :des.id,
                "pic"           :"certificate/imgfiles/"+str(des.pic),
        }
        return res_success("修改表单成功",data)
    else:
        return res_fail(1,"表单信息不合法")

def delete_certificate(request):
#    user = request.COOKIES.get('username')
#    if user is None:
#        return res_fail(2,"未登陆")
    if request.method != 'GET':
        return res_fail(1,"method need to be GET!")

#    print(request.GET)
    if int(request.GET['login_stats']) == 0:
        return res_fail(2,"未登陆")

    des_id = request.GET['id']
#    des_id = 1
    try:
        des = certificate_data.objects.get(id = des_id)
    except certificate_data.DoesNotExist:
        return res_fial(1,"该编号证书已不存在")

    old_path = des.pic.path
    os.remove(old_path)

    des.delete()
    return res_success("删除成功",{"id":des_id})

def get_certificate_list(request,page,):
#    user = request.COOKIES.get('username')
#    if user is None:
#        return res_fail(2,"未登陆")
    if int(request.GET['login_stats']) == 0:
        return res_fail(2,"未登陆")

    page = int(page)
    ceti_all = certificate_data.objects.all()
    ceti_all = ceti_all.order_by('certificate_id')
    limit = ceti_all.count()

    lowerset  = pagesize*(page-1)
    if page*pagesize >limit:
        upperset = limit
    else: 
        upperset = page*pagesize

    data = ceti_all[lowerset:upperset]
    json_data_list = []
    for item in data:
        json_data = json.loads(item.toJSON())
        json_data_list.append(json_data)

    return res_success("成功",json_data_list)

def total_page(request):
    ceti_all = certificate_data.objects.all()
    limit = ceti_all.count()
    if limit > (int(limit/pagesize))*pagesize:
        pagecount = int(limit/pagesize) + 1
    else:
        pagecount = int(limit/pagesize)

    return res_success("",{'totalpage':pagecount,
        'totalcertificate':limit,})




