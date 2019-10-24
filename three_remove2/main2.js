var CONFIG = null
var GRID = null
var CEIL_WIDTH = 35
var CEIL_HEIGHT = 35
var BORDER_WIDTH = 2
var ROLEID = 2049
var MODULE = "three-remove2"
var BASE_URL = "http://192.168.206.253:8001/"
var SELECT_1 = null
var SELECT_2 = null
var ANIMATE_TIME = 200
var ANIMATE_TIME_TEST = 500
var TOTAL_DOWN = 0

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
            module: MODULE,
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
    _getConfig();
    $.ajax({
        url: BASE_URL,
        async: true,
        cache: false,
        type: "post",
        dataType: 'json',
        crossDomain: true,
        data: {
            module: MODULE,
            method: "initPane",
            param: JSON.stringify([ROLEID])
        }
    }).done(function (res) {
        if (res.errorCode == 0) {
            console.info("生成棋盘成功")
            $("#pane").empty()
            GRID = res.data
            console.log(GRID)
            _drawGrid()
        } else {
            console.error("生成棋盘失败")
        }
    })
}

// id = x|y
function _addPoints(point) {
    var id = point.id
    var el = CONFIG.config[id]
    var status = CONFIG.status
    if (!el) {
        return;
    }
    var color = el.color
    var score = el.score
    var x = point.x
    var y = point.y
    var st = point.status
    var desTop = CEIL_WIDTH * (x - 1) + (x - 1) * BORDER_WIDTH * 2 + BORDER_WIDTH
    var elId = x + "|" + y
    var $ceil = $("<div id='" + elId + "' class='pane-ceil'></div > ").css({
        width: CEIL_WIDTH,
        height: CEIL_HEIGHT,
        top: 0,
        left: CEIL_HEIGHT * (y - 1) + (y - 1) * BORDER_WIDTH * 2 + BORDER_WIDTH,
        backgroundColor: color
    })
    $ceil.attr("_id", id)
    $ceil.attr("score", score)
    $ceil.attr("status", st)
    if (st == status.REMOVED) {
        $ceil.addClass("pane-ceil-removed")
    }
    $("#pane").append($ceil)
    $ceil.animate({
        top: desTop
    }, ANIMATE_TIME)
}

function _drawGrid() {
    $("#pane").css({
        width: (GRID.length + 1) * (BORDER_WIDTH * 2) + GRID.length * CEIL_WIDTH,
        height: (GRID[0].length + 1) * (BORDER_WIDTH * 2) + GRID[0].length * CEIL_HEIGHT
    })
    for (var i = 0; i < GRID.length; i++) {
        for (var j = 0; j < GRID[i].length; j++) {
            _addPoints(GRID[i][j])
        }
    }
}

function _movePoint(from, to) {
    var $p = _getCeilByPos(from)
    if ($p != null) {
        $p.animate({
            top: CEIL_WIDTH * (to.x - 1) + (to.x - 1) * BORDER_WIDTH * 2 + BORDER_WIDTH
        }, ANIMATE_TIME, function () {
            $p.attr("id", to.x + "|" + to.y)
        })
    }
}

function _moveDownAnimation($p, step, news, total) {
    var tmp = $p.attr("id").split("|")
    var x = parseInt(tmp[0])
    var y = parseInt(tmp[1])
    var endX = x + step
    $p.attr("id", endX + "|" + y)
    $p.animate({
        top: CEIL_WIDTH * (endX - 1) + (endX - 1) * BORDER_WIDTH * 2 + BORDER_WIDTH
    }, ANIMATE_TIME, function () {
        TOTAL_DOWN++
        if (total == TOTAL_DOWN) {
            _bornNews(news)
            TOTAL_DOWN = 0
        }
    })
}

function _fillVertical(y, news, total) {
    for (var x = CONFIG.rows; x > 0; x--) {
        var $p = _getCeilByPos({ x: x, y: y })
        if ($p == null) {
            continue
        }
        var step = 0
        var nullPos = { x: x, y: y }
        // TODO 用坐标计算移动
        for (var tmpX = x + 1; tmpX <= CONFIG.rows; tmpX++) {
            var $tmpP = _getCeilByPos({ x: tmpX, y: y })
            if ($tmpP == null) {
                step++
            }
        }
        _moveDownAnimation($p, step, news, total)
    }
}

function _downToBottom(removes, news) {
    var range = _getDownRange(removes)
    var min = range.min
    var max = range.max
    var total = (max - min + 1) * CONFIG.rows - removes.length
    for (var j = min; j <= max; j++) {
        _fillVertical(j, news, total)
    }
}

function _getDownRange(removes) {
    var res = {
        min: CONFIG.cols + 1,
        max: 0
    }
    for (var i = 0; i < removes.length; i++) {
        var pos = removes[i]
        if (pos.y < res.min) {
            res.min = pos.y
        }
        if (pos.y > res.max) {
            res.max = pos.y
        }
    }
    return res
}

function _getCeilByPos(pos) {
    return $("#" + pos.x + "\\|" + pos.y)[0] == undefined ? null : $("#" + pos.x + "\\|" + pos.y)
}

function _delCeilByPos(pos) {
    $("#" + pos.x + "\\|" + pos.y).remove()
}

function _remove(removes) {
    for (var i = 0; i < removes.length; i++) {
        var pos = removes[i]
        _delCeilByPos(pos)
    }

}

function _bornNews(news) {
    for (var i = 0; i < news.length; i++) {
        var pos = news[i]
        _addPoints(pos)
    }
}

function _recursionAnimation(animations) {
    for (var i = 0; i < animations.length; i++) {
        setTimeout((animations) => {
            var removes = animations.removes
            var news = animations.news
            _remove(removes)
            _downToBottom(removes, news)
            // _bornNews(news)
        }, ANIMATE_TIME_TEST * i, animations[i])

    }
}

function _swapMoveTwoPoints(p1, p2) {
    var $p1 = _getCeilByPos(p1)
    var $p2 = _getCeilByPos(p2)
    if ($p1 != null && $p2 != null) {
        var left = $p1.position().left
        var top = $p1.position().top
        var tmp = $p1.attr("id").split("|")
        var x = tmp[0]
        var y = tmp[1]
        var newId = x + "|" + y
        $p1.animate({
            left: $p2.position().left,
            top: $p2.position().top
        }, ANIMATE_TIME)
        $p1.attr("id", $p2.attr("id"))
        $p2.animate({
            left: left,
            top: top
        }, ANIMATE_TIME)
        $p2.attr("id", newId)
    }
}

// TODO 移动交换点
function _exchange() {
    var p1 = SELECT_1
    var p2 = SELECT_2
    _swapMoveTwoPoints(p1, p2)
    $.ajax({
        url: BASE_URL,
        async: false,
        cache: false,
        type: "post",
        dataType: 'json',
        crossDomain: true,
        data: {
            module: MODULE,
            method: "doExchange",
            param: JSON.stringify([ROLEID, [SELECT_1, SELECT_2]])
        }
    }).done(function (res) {
        if (res.errorCode == 0) {
            console.info("交换成功")
            console.log(res.data)
            _recursionAnimation(res.data)
        } else {
            setTimeout(function () {
                _swapMoveTwoPoints(p1, p2)
            }, ANIMATE_TIME)
            console.error("交换失败")
        }
    })
}

function bindListener() {
    $("#pane").on("click", ".pane-ceil", function () {
        var tmp = $(this).attr("id").split("|")
        // console.log(tmp)
        var x = parseInt(tmp[0])
        var y = parseInt(tmp[1])
        if ($(this).hasClass("pane-ceil-selected")) {
            $(this).removeClass("pane-ceil-selected")
            SELECT_1 = null
            return
        }
        $("#pane").find(".pane-ceil-selected").removeClass("pane-ceil-selected")
        $(this).addClass("pane-ceil-selected")
        if (SELECT_1 != null) {
            SELECT_2 = {
                x: x,
                y: y
            }
            _exchange()
            SELECT_1 = SELECT_2 = null
            $("#pane").find(".pane-ceil-selected").removeClass("pane-ceil-selected")
        } else {
            SELECT_1 = {
                x: x,
                y: y
            }
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
                module: MODULE,
                method: "exit",
                param: JSON.stringify([ROLEID])
            }
        }).done(function (res) {
            if (res.errorCode == 0) {
                console.info("退出成功")
                init()
            } else {
                console.error("退出失败")
            }
        })
    })
}