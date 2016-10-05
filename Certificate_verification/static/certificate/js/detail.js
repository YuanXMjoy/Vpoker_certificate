/**
 * Created by JOYyuan on 16/8/2.
 */
$(document).ready(
    function () {
        certificateGet();
        imgDownload();
    }
);
function certificateGet() {
    $.get("/certificate/detail/" + sessionStorage.certificateId + "/get_pic/", function (res) {
        var imgUrl ="http://"+window.location.host+"/"+res.pic;
        if (imgUrl.length == 0) {
            alert("获取证书图片失败")
        } else {
            $("#certificateImg").attr("src", imgUrl);
        }
    })
}
function imgDownload() {
    $("#downloadBtn").click(function () {
        window.location.href = "/certificate/detail/" + sessionStorage.certificateId + "/download/";
    });
}
