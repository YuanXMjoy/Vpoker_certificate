#coding=utf-8
from django.conf.urls import url,include
from . import views
from django.conf import settings
from django.views.static import serve


urlpatterns =[
    #返回页面部分
#    url(r'^admin/admin/$',views.admin_page),
#    url(r'^admin/login/$',views.login_page),
#    url(r'^index/$',views.search_page),
#    url(r'^detail/(?P<pk>[0-9]+)/$',views.detail_page,name='detail_page'),
#    url(r'^get_csrf/$',views.ensure_csrf),

    #返回验证码
    url(r'^getcode/$',views.get_code),

    #返回请求部分
    #前端部分
    url(r'^detail/(?P<pk>[0-9]+)/get_pic/$',views.get_certificate_pic),
    url(r'^index/search/$',views.search_certificate),
    url(r'^detail/(?P<pk>[0-9]+)/download/$',views.certificate_download),

    #后台部分
    url(r'^admin/log_in/$',views.log_in),
    url(r'^admin/log_out/$',views.log_out),
    url(r'^admin/add/$',views.add_certificate),
    url(r'^admin/edit/$',views.edit_certificate),
    url(r'^admin/delete/$',views.delete_certificate),
    url(r'^admin/certificate_list/(?P<page>[0-9]+)/$',views.get_certificate_list),
    url(r'^admin/certificate_list/page/$',views.total_page),
]

urlpatterns +=[
    url(r'^web/(?P<path>.*)$',serve,{
        'document_root':settings.STATIC_ROOT,
        }),
    url(r'^imgfiles/(?P<path>.*)$',serve,{
        'document_root':settings.MEDIA_ROOT,
        }),
]