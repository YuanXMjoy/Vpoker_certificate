/**
 * Created by JOYyuan on 16/7/31.
 */
$(document).ready(
    function () {
        $("#loginForm").validate({
            debug: false,
            rules: {
                account: {
                    required: true,
                    minlength:1,
                    maxlength:18
                },
                password:{
                    required:true,
                    minlength:1,
                    maxlength:18
                },
                code:{
                    required:true,
                    minlength:6,
                    maxlength:6

                }
            },
            messages: {
                account: {
                    required: "请输入帐号"
                }
            },
            submitHandler: function (form) {
                if ($("#loginForm").valid()) {
                    loginGet();

                }
            }
        });
        codeImgGet();
        newCode();
    }
);
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


function codeImgGet() {
    $.get("/certificate/getcode/", function () {
        $("#codeImg").attr("src", "/certificate/getcode/");
    });
}
function newCode() {
    $("#codeImg").click(function () {
        codeImgGet();
    });
}
function loginGet() {
        var userName = $("#account").val();
        var psw = $("#password").val();
        var code = $("#code").val();
        loginSend(userName, psw, code);
}
function loginSend(user, key, codeNow) {
    $.post("/certificate/admin/log_in/", {
        "username": user,
        "password": key,
        "code": codeNow
    }, function (res) {
        var status = res.res_code;
        var des = res.desc;
        alert(des);
        switch (status) {
            case 0:
                alert("登录成功");
                sessionStorage.username = user;
                window.location.href = "list.html";
                break;
            case 1:
                window.location.reload();
                alert("登录失败");
                break;
        }
    });
}