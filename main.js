var CONFIG = null
var MAX_X = 10
var MAX_Y = 10
var CEIL_WIDTH = 35
var CEIL_HEIGHT = 35
var BORDER_WIDTH = 2
var ROLEID = 2049
var SELECTED_CEIL_1 = null
var SELECTED_CEIL_2 = null
var BASE_URL = "http://192.168.206.253:8001/"

$(function () {
    getConfig();
    init();
    bindListener();
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
            // param: {}
            param: JSON.stringify([])
        }
    }).done(function (res) {
        if (res.errorCode == 0) {
            CONFIG = res.data
            console.info("获取配置成功")
            console.info(CONFIG)
        } else {
            console.error("获取配置失败")
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
            // param: {
            //     0: ROLEID
            // }
            param: JSON.stringify([ROLEID])
        }
    }).done(function (res) {
        if (res.errorCode == 0) {
            console.info("生成棋盘成功")
            console.info(res.data)
            drawPane(res.data)
        } else {
            console.error("生成棋盘失败")
        }
    })
}

function drawPane(pane) {
    if (pane.length < 3 || pane[0] != null && pane[0].length < 3) {
        return
    }
    $("#pane").css({
        width: (pane.length + 1) * (BORDER_WIDTH * 2) + pane.length * CEIL_WIDTH,
        height: (pane[0].length + 1) * (BORDER_WIDTH * 2) + pane[0].length * CEIL_HEIGHT
    })
    for (var i = 0; i < pane.length; i++) {
        for (var j = 0; j < pane[i].length; j++) {
            var el = CONFIG[pane[i][j]]
            if (!el) {
                continue;
            }
            var _id = el.id
            var _score = el.score
            var _color = el.color
            var $ceil = $("<div class='pane-ceil' id='" + _id + "' score='" + _score + "' color='" + _color + "' x='" + i + "' y='" + j + "'>" +
                "<div class= 'ceil-comment' > " + "[id]: " + _id + ", [score]: " + _score + ", [color]: " + _color + "" + "</div >" +
                "</div > ").css({
                    width: CEIL_WIDTH,
                    height: CEIL_HEIGHT,
                    left: CEIL_WIDTH * i + i * BORDER_WIDTH * 2 + BORDER_WIDTH,
                    top: CEIL_HEIGHT * j + j * BORDER_WIDTH * 2 + BORDER_WIDTH,
                    backgroundColor: _color
                })
            $("#pane").append($ceil)
        }
    }
}

function _getExchangeResult() {
    var p1 = SELECTED_CEIL_1
    var p2 = SELECTED_CEIL_2
    $.ajax({
        url: BASE_URL,
        async: true,
        cache: false,
        type: "post",
        dataType: 'json',
        crossDomain: true,
        data: {
            module: "three-remove",
            method: "doExchange",
            param: JSON.stringify([ROLEID, [SELECTED_CEIL_1, SELECTED_CEIL_2]])
        }
    }).done(function (res) {
        if (res.errorCode == 0) {
            console.info("交换成功")
            var $p1 = $("#pane .pane-ceil[id=" + p1.id + "][x=" + p1.x + "][y=" + p1.y + "]")
            var $p2 = $("#pane .pane-ceil[id=" + p2.id + "][x=" + p2.x + "][y=" + p2.y + "]")
            var desP1Left = $p2.position().left
            var desP1Top = $p2.position().top
            var desP2Left = $p1.position().left
            var desP2Top = $p1.position().top
            $p1.animate({
                left: desP1Left,
                top: desP1Top
            })
            $p2.animate({
                left: desP2Left,
                top: desP2Top
            })
            var tmpX = parseInt($p1.attr("x"))
            var tmpY = parseInt($p1.attr("y"))
            $p1.attr("x", parseInt($p2.attr("x")))
            $p1.attr("y", parseInt($p2.attr("y")))
            $p2.attr("x", tmpX)
            $p2.attr("y", tmpY)
        } else {
            console.error("交换失败")
        }
    })
    _clearSelectedCeil()
}

function _clearSelectedCeil() {
    SELECTED_CEIL_1 = null
    SELECTED_CEIL_2 = null
}

function bindListener() {
    $("#pane").on("click", ".pane-ceil", function () {
        if ($(this).hasClass("pane-ceil-selected")) {
            $(this).removeClass("pane-ceil-selected")
            _clearSelectedCeil()
            return
        }
        var id = parseInt($(this).attr("id"))
        var x = parseInt($(this).attr("x"))
        var y = parseInt($(this).attr("y"))
        if ($("#pane").find(".pane-ceil-selected").length > 0) {
            if (id == SELECTED_CEIL_1.id ||
                x != SELECTED_CEIL_1.x && y != SELECTED_CEIL_1.y ||
                x == SELECTED_CEIL_1.x && Math.abs(y - SELECTED_CEIL_1.y) > 1 ||
                y == SELECTED_CEIL_1.y && Math.abs(x - SELECTED_CEIL_1.x) > 1) {
                $("#pane .pane-ceil").removeClass("pane-ceil-selected")
                _clearSelectedCeil()
                return
            }
            SELECTED_CEIL_2 = {
                id: id,
                x: x,
                y: y
            }
            // 发送到服务器
            _getExchangeResult()
            $("#pane .pane-ceil").removeClass("pane-ceil-selected")
        } else {
            SELECTED_CEIL_1 = {
                id: id,
                x: x,
                y: y
            }
            $("#pane .pane-ceil").removeClass("pane-ceil-selected")
            $(this).addClass("pane-ceil-selected")
        }
    })

    $("#exit").click(function () {
        $.ajax({
            url: BASE_URL,
            async: true,
            cache: false,
            type: "post",
            dataType: 'json',
            crossDomain: true,
            data: {
                module: "three-remove",
                method: "exit",
                // param: {
                //     0: ROLEID
                // }
                param: JSON.stringify([ROLEID])
            }
        }).done(function (res) {
            if (res.errorCode == 0) {
                console.info("退出成功")
            } else {
                console.error("退出失败")
            }
        })
    })
}