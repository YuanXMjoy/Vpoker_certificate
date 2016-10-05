/**
 * Created by JOYyuan on 16/8/1.
 */
var cardList;
var deleteId;
var editId;
var stuId;
var pageId = 1;
var loginStatus=0;
$(document).ready(function () {
     $("body").hide();
     var username = sessionStorage.username;
     if (username == undefined) {
     window.location.href = "login.html";
     } else {
     loginStatus=1;
     $("body").show();
     $("#username").html(username);
     listGet();
     picLoad();
     modalCleanUp();
     listLogout();
     rePicLoad();
     }

    $("#addForm").validate({
        debug: false,
        rules: {
            cardNumber: {
                required: true,
                minlength: 1,
                maxlength: 18
            },
            stuNum: {
                required: true,
                minlength: 1,
                maxlength: 18
            },
            img_input: {
                required: true

            }
        },
        messages: {
            cardNumber: {
                required: "请输入证书号码"
            },
            stuNum: {
                required: "请输入学生帐号"
            },
            img_input: {
                required: "请选择文件"
            }

        },
        submitHandler: function (form) {
            if ($("#addForm").valid()) {
                cardAdd();
            }
        }
    });
    $("#editForm").validate({
        debug: false,
        rules: {
            editCardNumber: {
                required: true,
                minlength: 1,
                maxlength: 18
            },
            editStuNum: {
                required: true,
                minlength: 1,
                maxlength: 18
            },
            inputfilePic: {
                required: true

            }
        },
        messages: {
            editCardNumber: {
                required: "请输入证书号码"
            },
            editStuNum: {
                required: "请输入学生帐号"
            },
            inputfilePic: {
                required: "请选择文件"
            }

        },
        submitHandler: function (form) {
            if ($("#editForm").valid()) {
                putInfo();
            }
        }
    });


});
// csrf
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function listGet() {
    $.get("/certificate/admin/certificate_list/" + pageId + "/",{
            login_stats:loginStatus

        },
        function (res) {
            cardList = res.data;
            var status = res.res_code;
            listGenerate();
        });
}
function listGenerate() {
    var t = "";
    t += '<table id="cardTable">';
    t += " <tr>" +
        "<th class='orderId' >id</th>" +
        "<th class='certificateId'>证书编号</th>" +
        "<th class='stuId'>VPOKER学号</th>" +
        "<th class='cardImgBox'>证书图片</th>" +
        "<th class='createTime'>创建的时间</th>" +
        "<th class='action'>操作</th>" +
        "</tr>";
    for (var i = 0; i < cardList.length; i++) {
        t += "<tr>";
        t += "<td>" + cardList[i].id + "</td>";
        t += "<td>" + cardList[i].certificate_id + "</td>";
        t += "<td>" + cardList[i].vpoker_stuid + "</td>";
        t += "<td>" + "<img class='img-thumbnail'>" + "</td>";
        t += "<td>" + cardList[i].add_date + "</td>";
        t += "<td>" + "<div class='actionBox'><div class='editBox' style='display: inline '></div>&emsp;<div class='deleteBox' style='display: inline'></div></div>" + "</td>";
        t += "</tr>";
    }
    t += "</table>";
    $('#adminList').append(t);

    $(".img-thumbnail").each(function (b) {
        $(this).attr('id', 'cardImg' + b)
    });
    for (var a = 0; a < cardList.length; a++) {
        var imgURL = "http://" + window.location.host + "/" + cardList[a].pic;
        $("#cardImg" + a).attr('src', imgURL);
    }
    $(".editBox").each(function (c) {
        $(this).attr('id', 'editId' + c)
    });
    $(".deleteBox").each(function (d) {
        $(this).attr('id', 'delId' + d)
    });
    //删除按钮的生成
    for (var k = 0; k < cardList.length; k++) {
        var delBtn = document.createElement("button");
        var realId = cardList[k].id;
        delBtn.innerHTML = "删除";
        delBtn.id = 'del' + realId;
        $(delBtn).attr("class", "btn btn-default");
        (function (k) {
            delBtn.addEventListener("click", function (d) {
                $('#delConfirm').off('click');
                deleteId = cardList[k].id;
                $('#delModal').modal('show');
                $('#delConfirm').one('click', function () {
                    listDelete();
                });
            }, false);
        })(k);
        $('#delId' + k).append(delBtn);
    }
    //编辑按钮的生成
    for (var f = 0; f < cardList.length; f++) {
        var editBtn = document.createElement("button");
        editBtn.innerHTML = "编辑";
        editBtn.id = 'edit' + cardList[f].id;
        var pic = document.createElement("img");

        $(editBtn).attr("class", "btn btn-default");
        (function (f) {
            editBtn.addEventListener("click", function (d) {
                editId = cardList[f].certificate_id;
                stuId = cardList[f].vpoker_stuid;
                $('#editModal').modal('show');
                $("#editCardNumber").val(editId);
                $("#editStuNum").val(stuId);
                pic.src = "http://" + window.location.host + "/" + cardList[f].pic;
                $("#re_preview").empty().append(pic);
            }, false);
        })(f);
        $('#editId' + f).append(editBtn);
    }
    pageGet();
}

function listDelete() {
    $.get(
        "/certificate/admin/delete",
        {
            id: deleteId,
            login_stats:loginStatus
        },
        function (res) {
            var status = res.res_code;
            switch (status) {
                case 0:
                    $("#delConfirm").modal('hide');
                    alert("删除成功");
                    window.location.reload();
                    break;
                case 1:
                    alert("删除失败");
                    break;
            }
        });
}

function putInfo() {
    //formdata对象
    var edit_data = new FormData();
    var reCardAdd = $("#editCardNumber").val();
    var reStuAdd = $("#editStuNum").val();
    var reFile = $("#inputfilePic").prop("files")[0];
    //将数据填充到formdata中
    edit_data.append("certificate_id", reCardAdd);
    edit_data.append("pic", reFile);
    edit_data.append("vpoker_stuid", reStuAdd);
    edit_data.append("login_stats",loginStatus);
    $.ajax({
        type: "POST",
        url: "/certificate/admin/edit/",
        dataType: "json",
        processData: false,
        contentType: false,
        data: edit_data
    }).success(function (msg) {
        $("#editModal").modal("hide");
        alert("编辑成功！");
        console.log(msg);
    }).fail(function (msg) {
        alert("连接服务器失败,请求未发出");
        console.log(msg);
    });

}
function cardAdd() {
    var cardId = $("#cardNumber").val();
    var stuAdd = $("#stuNum").val();
    var form_data = new FormData();
    var file_data = $("#img_input").prop("files")[0];
// 把上传的数据放入form_data
    form_data.append("certificate_id", cardId);
    form_data.append("pic", file_data);
    form_data.append("vpoker_stuid", stuAdd);
    form_data.append("login_stats",loginStatus);

    $.ajax({
        type: "POST", // 上传文件要用POST
        url: "/certificate/admin/add/",
        dataType: "json",
        processData: false,  // 注意：不要 process data
        contentType: false,  // 注意：不设置 contentType
        data: form_data
    }).success(function (msg) {
        $("#addBox").modal("hide");
        modalCleanUp();
        alert("添加证书成功");
        console.log(msg);
    }).fail(function (msg) {
        console.log(msg);
    });
}

function picLoad() {
    $("#img_input").on("change", function (g) {
        var file = g.target.files[0]; //获取图片资源
        // 只选择图片文件
        if (!file.type.match('image.*')) {
            return false;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file); // 读取文件
        // 渲染文件
        reader.onload = function (arg) {
            var img = '<img class="preview" src="' + arg.target.result + '" alt="preview"/>';
            $("#preview").empty().append(img);
        }
    });

}
function rePicLoad() {
    $("#inputfilePic").on("change", function (g) {
        var file = g.target.files[0]; //获取图片资源
        // 只选择图片文件
        if (!file.type.match('image.*')) {
            return false;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file); // 读取文件
        // 渲染文件
        reader.onload = function (arg) {
            var img = '<img class="preview" src="' + arg.target.result + '" alt="preview"/>';
            $("#re_preview").empty().append(img);
        }
    });

}
function modalCleanUp() {
    $('#addBox').on('hide.bs.modal', function () {
        $("#cardNumber").val("");
        $("#stuNum").val("");
        $(".preview_box").empty();
        $("#img_input").val(undefined);
    });
}
function listLogout() {
    $("#exit").click(function () {
        sessionStorage.clear();
        window.location.href = "login.html";
    });
}
function pageGet() {
    $.get("/certificate/admin/certificate_list/page/", function (res) {
        var pageTotal = res.data.totalpage;
        var numTotal = res.data.totalcertificate;
        pageListBuild(pageTotal);
    });
}
function pageListBuild(pages) {
    var pagesOut = "每页10条数据，共有" + pages + "页";
    var ulEle = document.createElement('ul');
    $('.pageP').html(pagesOut);
    $(ulEle).addClass('pagination')
        .appendTo($('#pagesGroup'));
    for (var i = 0; i < pages; i++) {
        var li = document.createElement("li");
        li.id = "page_" + i;
        $("ul").append(li);
    }
    for (var k = 0; k < pages; k++) {
        var turnValue = k + 1;
        var pageValue = "" + turnValue;
        var aPage = document.createElement("a");
        aPage.innerHTML = pageValue;
        (function (k) {
            aPage.addEventListener("click", function () {
                var page = k + 1;
                pageId = Number(page);
                $('#cardTable').remove();
                $(ulEle).remove();
                listGet();
            }, false);
        })(k);
        $("#page_" + k).append(aPage);
    }
    var liId = pageId - 1;
    $("#page_" + liId).addClass("active");
}