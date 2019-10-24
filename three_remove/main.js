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
    init();
    bindListener();
})

function _getConfig() {
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
            CONFIG = res.data.config
            MAX_X = res.data.height
            MAX_Y = res.data.width
            console.info("获取配置成功")
            console.info(CONFIG)
        } else {
            console.error("获取配置失败")
        }
    })
}



function init() {
    _getConfig();
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

function _addPoints(id, x, y) {
    var el = CONFIG[id]
    if (!el) {
        return;
    }
    var color = el.color
    var score = el.score
    var desTop = CEIL_WIDTH * (x - 1) + (x - 1) * BORDER_WIDTH * 2 + BORDER_WIDTH
    var $ceil = $("<div class='pane-ceil' _id='" + id + "' score='" + score + "' color='" + color + "' x='" + x + "' y='" + y + "'>" +
        "<div class= 'ceil-comment' > " + "[id]: " + id + ", [score]: " + score + ", [color]: " + color + ", [x]: " + x + ", [y]: " + y + "</div >" +
        "</div > ").css({
            width: CEIL_WIDTH,
            height: CEIL_HEIGHT,
            top: 0,
            left: CEIL_HEIGHT * (y - 1) + (y - 1) * BORDER_WIDTH * 2 + BORDER_WIDTH,
            backgroundColor: color
        })
    $("#pane").append($ceil)
    $ceil.animate({
        top: desTop
    }, 200)
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
            _addPoints(pane[i][j], i + 1, j + 1)
        }
    }
}

function _getExchangeResult() {
    var p1 = SELECTED_CEIL_1
    var p2 = SELECTED_CEIL_2
    console.log(p1)
    console.log(p2)
    var result = {
        code: -1,
        data: null,
        p1: p1,
        p2: p2
    }
    $.ajax({
        url: BASE_URL,
        async: false,
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
            result.code = 0
            result.data = res.data
        } else {
            console.error("交换失败")
            result = 1
        }
    })
    return result
}

function _exchangePoints(p1, p2) {
    var $p1 = $("#pane .pane-ceil[_id=" + p1.id + "][x=" + p1.x + "][y=" + p1.y + "]")
    var $p2 = $("#pane .pane-ceil[_id=" + p2.id + "][x=" + p2.x + "][y=" + p2.y + "]")
    var desP1Left = $p2.position().left
    var desP1Top = $p2.position().top
    var desP2Left = $p1.position().left
    var desP2Top = $p1.position().top
    $p1.animate({
        left: desP1Left,
        top: desP1Top
    }, 200)
    $p2.animate({
        left: desP2Left,
        top: desP2Top
    }, 200)
    var tmpX = parseInt($p1.attr("x"))
    var tmpY = parseInt($p1.attr("y"))
    $p1.attr("x", parseInt($p2.attr("x")))
    $p1.attr("y", parseInt($p2.attr("y")))
    $p2.attr("x", tmpX)
    $p2.attr("y", tmpY)
    var p1_id = $p1.attr("_id")
    var p1_score = $p1.attr("score")
    var p1_color = $p1.attr("color")
    var p1_x = $p1.attr("x")
    var p1_y = $p1.attr("y")
    var p2_id = $p2.attr("_id")
    var p2_score = $p2.attr("score")
    var p2_color = $p2.attr("color")
    var p2_x = $p2.attr("x")
    var p2_y = $p2.attr("y")
    $p1.find(".ceil-comment").html("[id]: " + p1_id + ", [score]: " + p1_score + ", [color]: " + p1_color + ", [x]: " + p1_x + ", [y]: " + p1_y)
    $p2.find(".ceil-comment").html("[id]: " + p2_id + ", [score]: " + p2_score + ", [color]: " + p2_color + ", [x]: " + p2_x + ", [y]: " + p2_y)
}

function _moveDownAnimation($p, step) {
    var endX = parseInt($p.attr("x")) + step
    $p.attr("x", endX)
    $p.animate({
        left: $p.position().left,
        top: $p.position().top + (CEIL_HEIGHT + BORDER_WIDTH * 2) * step
    }, 200)
    return endX
}

function _clearSelectedCeil() {
    SELECTED_CEIL_1 = null
    SELECTED_CEIL_2 = null
}

function _fillVertical(y) {
    for (var x = MAX_X; x > 0; x--) {
        var $p = $("#pane .pane-ceil[x=" + x + "][y=" + y + "]")
        if ($p[0] == undefined) {
            continue
        }
        var step = 0
        for (var tmpX = x + 1; tmpX <= MAX_X; tmpX++) {
            var $tmpP = $("#pane .pane-ceil[x=" + tmpX + "][y=" + y + "]")
            if ($tmpP[0] == undefined) {
                step++
            }
        }
        _moveDownAnimation($p, step)
    }
}

function _doRemoveAnimation(removeRange, removes, fillPoints) {
    for (var i = 0; i < removes.length; i++) {
        var p = removes[i]
        var $p = $("#pane .pane-ceil[_id=" + p.id + "][x=" + p.x + "][y=" + p.y + "]")
        var $clone = $p.clone()
        $clone.removeClass("pane-ceil")
        $clone.addClass("pane-ceil-clone")
        if ($p[0] == undefined) {
            continue
        }
        $p.remove()
        $clone.fadeOut(100, function () {
            $(this).remove()
        })
    }
    setTimeout(function () {
        var min = removeRange.minY
        var max = removeRange.maxY
        for (var i = min; i <= max; i++) {
            _fillVertical(i)
        }
        setTimeout(function () {
            for (var i = 0; i < fillPoints.length; i++) {
                var fillP = fillPoints[i]
                _addPoints(fillP.id, fillP.x, fillP.y)
            }
        }, 250)
    }, 200)

}

function bindListener() {
    $("#pane").on("click", ".pane-ceil", function () {
        if ($(this).hasClass("pane-ceil-selected")) {
            $(this).removeClass("pane-ceil-selected")
            _clearSelectedCeil()
            return
        }
        var id = parseInt($(this).attr("_id"))
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
            var promise = new Promise(function (resolve, reject) {
                resolve(_getExchangeResult())
            })
            promise.then((e) => {
                if (e.code == 0) {
                    var promise1 = new Promise(function (resolve, reject) {
                        resolve(_exchangePoints(e.p1, e.p2))
                    })
                    promise1.then(() => {
                        setTimeout(function () {
                            var res = e.data
                            if (res.isRemove) {
                                var removeRange = res.removeRange
                                var removes = res.removes
                                var fillPoints = res.fillPoints
                                var lastPoints = res.lastPoints
                                // console.log(removes)
                                // console.log(lastPoints)
                                // console.log(removeRange)
                                _doRemoveAnimation(removeRange, removes, fillPoints)
                            }
                        }, 250)
                    })
                }
                _clearSelectedCeil()
            })
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