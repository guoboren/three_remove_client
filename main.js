var CONFIG = null
var MAX_X = 10
var MAX_Y = 10
var CEIL_WIDTH = 35
var CEIL_HEIGHT = 35
var CEIL_MARGIN = 5
var BASE_URL = "http://192.168.190.253:8001/"

$(function () {
    getConfig();
    init();
})

function getConfig() {
    $.ajax({
        url: BASE_URL,
        async: false,
        cache: false,
        type: "post",
        dataType: 'json',
        crossDomain: true,
        data: {
            module: "three-remove",
            method: "getConfig",
            param: {

            }
        },
        success: function (res) {
            if (res.errorCode == 0) {
                CONFIG = res.data
                console.info("获取配置成功")
                console.info(CONFIG)
            } else {
                console.error("获取配置失败")
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown)
        }
    })
}



function init() {
    $.ajax({
        url: BASE_URL,
        async: true,
        cache: false,
        type: "post",
        dataType: 'json',
        crossDomain: true,
        data: {
            module: "three-remove",
            method: "initPane",
            param: {
                0: "root",
                1: "123456"
            }
        },
        success: function (res) {
            if (res.errorCode == 0) {
                console.info("生成棋盘成功")
                console.info(res.data)
                drawPane(res.data)
            } else {
                console.error("生成棋盘失败")
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown)
        }
    })
}

function drawPane(pane) {
    if (pane.length < 3 || pane[0].length < 3) {
        return
    }
    $("#pane").css({
        width: pane.length * CEIL_WIDTH + (pane.length + 1) * CEIL_MARGIN,
        height: pane[0].length * CEIL_HEIGHT + (pane.length + 1) * CEIL_MARGIN
    })
    for (var i = 0; i < pane.length; i++) {
        for (var j = 0; j < pane[i].length; j++) {
            var $ceil = $("<div class='pane-ceil'><div class='ceil-comment'></div></div>").css({
                width: CEIL_WIDTH,
                height: CEIL_HEIGHT,
                left: CEIL_WIDTH * i + (i + 1) * CEIL_MARGIN,
                top: CEIL_HEIGHT * j + (j + 1) * CEIL_MARGIN,
                backgroundColor: CONFIG[pane[i][j]].color
            })
            $("#pane").append($ceil)
        }
    }
}

