/**
 * Created by JOYyuan on 16/8/2.
 */
$(document).ready(
    function () {
        codeImgGet();
        newCode();
        searchGet();
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
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


function codeImgGet() {
    $.get("/certificate/getcode/", function () {
        $("#codePicture").attr("src", "/certificate/getcode/");
    });
}
function newCode() {
    $("#codePicture").click(function () {
        codeImgGet();
    });
}
function searchGet(){
    $("#findBtn").click(
        function(){
            var certificateNum = $("#cardNum").val();
            var codeIn = $("#code").val();
            searchSend(certificateNum,codeIn);
        }
    );

}
function searchSend(num,codeNow) {
    $.get("/certificate/index/search/",{
        "certificate_id":num,
        "code":codeNow
    },function(res){
        var status=res.res_code;
        var des=res.desc;
        switch (status){
            case 0:
                alert("查询成功");
                sessionStorage.certificateId=num;
                window.location.href="detail.html";
                break;
            case 1:
                alert(des);
                window.location.reload();
                break;
        }
    });
}

