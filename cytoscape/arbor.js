//
//  arbor.js - version 0.91
//  a graph vizualization toolkit
//
//  Copyright (c) 2011 Samizdat Drafting Co.
//  Physics code derived from springy.js, copyright (c) 2010 Dennis Hotson
// 
//  Permission is hereby granted, free of charge, to any person
//  obtaining a copy of this software and associated documentation
//  files (the "Software"), to deal in the Software without
//  restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following
//  conditions:
// 
//  The above copyright notice and this permission notice shall be
//  included in all copies or substantial portions of the Software.
// 
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//  OTHER DEALINGS IN THE SOFTWARE.
//

(function ($) {

    /*        etc.js */
    var trace = function (msg) {
        if (typeof(window) == "undefined" || !window.console) {
            return
        }
        var len = arguments.length;
        var args = [];
        for (var i = 0; i < len; i++) {
            args.push("arguments[" + i + "]")
        }
        eval("console.log(" + args.join(",") + ")")
    };
    var dirname = function (a) {
        var b = a.replace(/^\/?(.*?)\/?$/, "$1").split("/");
        b.pop();
        return"/" + b.join("/")
    };
    var basename = function (b) {
        var c = b.replace(/^\/?(.*?)\/?$/, "$1").split("/");
        var a = c.pop();
        if (a == "") {
            return null
        } else {
            return a
        }
    };
    var _ordinalize_re = /(\d)(?=(\d\d\d)+(?!\d))/g;
    var ordinalize = function (a) {
        var b = "" + a;
        if (a < 11000) {
            b = ("" + a).replace(_ordinalize_re, "$1,")
        } else {
            if (a < 1000000) {
                b = Math.floor(a / 1000) + "k"
            } else {
                if (a < 1000000000) {
                    b = ("" + Math.floor(a / 1000)).replace(_ordinalize_re, "$1,") + "m"
                }
            }
        }
        return b
    };
    var nano = function (a, b) {
        return a.replace(/\{([\w\-\.]*)}/g, function (f, c) {
            var d = c.split("."), e = b[d.shift()];
            $.each(d, function () {
                if (e.hasOwnProperty(this)) {
                    e = e[this]
                } else {
                    e = f
                }
            });
            return e
        })
    };
    var objcopy = function (a) {
        if (a === undefined) {
            return undefined
        }
        if (a === null) {
            return null
        }
        if (a.parentNode) {
            return a
        }
        switch (typeof a) {
            case"string":
                return a.substring(0);
                break;
            case"number":
                return a + 0;
                break;
            case"boolean":
                return a === true;
                break
        }
        var b = ($.isArray(a)) ? [] : {};
        $.each(a, function (d, c) {
            b[d] = objcopy(c)
        });
        return b
    };
    var objmerge = function (d, b) {
        d = d || {};
        b = b || {};
        var c = objcopy(d);
        for (var a in b) {
            c[a] = b[a]
        }
        return c
    };
    var objcmp = function (e, c, d) {
        if (!e || !c) {
            return e === c
        }
        if (typeof e != typeof c) {
            return false
        }
        if (typeof e != "object") {
            return e === c
        } else {
            if ($.isArray(e)) {
                if (!($.isArray(c))) {
                    return false
                }
                if (e.length != c.length) {
                    return false
                }
            } else {
                var h = [];
                for (var f in e) {
                    if (e.hasOwnProperty(f)) {
                        h.push(f)
                    }
                }
                var g = [];
                for (var f in c) {
                    if (c.hasOwnProperty(f)) {
                        g.push(f)
                    }
                }
                if (!d) {
                    h.sort();
                    g.sort()
                }
                if (h.join(",") !== g.join(",")) {
                    return false
                }
            }
            var i = true;
            $.each(e, function (a) {
                var b = objcmp(e[a], c[a]);
                i = i && b;
                if (!i) {
                    return false
                }
            });
            return i
        }
    };
    var objkeys = function (b) {
        var a = [];
        $.each(b, function (d, c) {
            if (b.hasOwnProperty(d)) {
                a.push(d)
            }
        });
        return a
    };
    var objcontains = function (c) {
        if (!c || typeof c != "object") {
            return false
        }
        for (var b = 1, a = arguments.length; b < a; b++) {
            if (c.hasOwnProperty(arguments[b])) {
                return true
            }
        }
        return false
    };
    var uniq = function (b) {
        var a = b.length;
        var d = {};
        for (var c = 0; c < a; c++) {
            d[b[c]] = true
        }
        return objkeys(d)
    };
    var arbor_path = function () {
        var a = $("script").map(function (b) {
            var c = $(this).attr("src");
            if (!c) {
                return
            }
            if (c.match(/arbor[^\/\.]*.js|dev.js/)) {
                return c.match(/.*\//) || "/"
            }
        });
        if (a.length > 0) {
            return a[0]
        } else {
            return null
        }
    };
    /*     kernel.js */
    var Kernel = function (b) {
        var k = window.location.protocol == "file:" && navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
        var a = (window.Worker !== undefined && !k);
        var i = null;
        var c = null;
        var f = [];
        f.last = new Date();
        var l = null;
        var e = null;
        var d = null;
        var h = null;
        var g = false;
        var j = {system: b, tween: null, nodes: {}, init: function () {
            if (typeof(Tween) != "undefined") {
                c = Tween()
            } else {
                if (typeof(arbor.Tween) != "undefined") {
                    c = arbor.Tween()
                } else {
                    c = {busy: function () {
                        return false
                    }, tick: function () {
                        return true
                    }, to: function () {
                        trace("Please include arbor-tween.js to enable tweens");
                        c.to = function () {
                        };
                        return
                    }}
                }
            }
            j.tween = c;
            var m = b.parameters();
            if (a) {
                trace("using web workers");
                l = setInterval(j.screenUpdate, m.timeout);
                i = new Worker(arbor_path() + "arbor.js");
                i.onmessage = j.workerMsg;
                i.onerror = function (n) {
                    trace("physics:", n)
                };
                i.postMessage({type: "physics", physics: objmerge(m, {timeout: Math.ceil(m.timeout)})})
            } else {
                trace("couldn't use web workers, be careful...");
                i = Physics(m.dt, m.stiffness, m.repulsion, m.friction, j.system._updateGeometry);
                j.start()
            }
            return j
        }, graphChanged: function (m) {
            if (a) {
                i.postMessage({type: "changes", changes: m})
            } else {
                i._update(m)
            }
            j.start()
        }, particleModified: function (n, m) {
            if (a) {
                i.postMessage({type: "modify", id: n, mods: m})
            } else {
                i.modifyNode(n, m)
            }
            j.start()
        }, physicsModified: function (m) {
            if (!isNaN(m.timeout)) {
                if (a) {
                    clearInterval(l);
                    l = setInterval(j.screenUpdate, m.timeout)
                } else {
                    clearInterval(d);
                    d = null
                }
            }
            if (a) {
                i.postMessage({type: "sys", param: m})
            } else {
                i.modifyPhysics(m)
            }
            j.start()
        }, workerMsg: function (n) {
            var m = n.data.type;
            if (m == "geometry") {
                j.workerUpdate(n.data)
            } else {
                trace("physics:", n.data)
            }
        }, _lastPositions: null, workerUpdate: function (m) {
            j._lastPositions = m;
            j._lastBounds = m.bounds
        }, _lastFrametime: new Date().valueOf(), _lastBounds: null, _currentRenderer: null, screenUpdate: function () {
            var n = new Date().valueOf();
            var m = false;
            if (j._lastPositions !== null) {
                j.system._updateGeometry(j._lastPositions);
                j._lastPositions = null;
                m = true
            }
            if (c && c.busy()) {
                m = true
            }
            if (j.system._updateBounds(j._lastBounds)) {
                m = true
            }
            if (m) {
                var o = j.system.renderer;
                if (o !== undefined) {
                    if (o !== e) {
                        o.init(j.system);
                        e = o
                    }
                    if (c) {
                        c.tick()
                    }
                    o.redraw();
                    var p = f.last;
                    f.last = new Date();
                    f.push(f.last - p);
                    if (f.length > 50) {
                        f.shift()
                    }
                }
            }
        }, physicsUpdate: function () {
            if (c) {
                c.tick()
            }
            i.tick();
            var n = j.system._updateBounds();
            if (c && c.busy()) {
                n = true
            }
            var o = j.system.renderer;
            var m = new Date();
            var o = j.system.renderer;
            if (o !== undefined) {
                if (o !== e) {
                    o.init(j.system);
                    e = o
                }
                o.redraw({timestamp: m})
            }
            var q = f.last;
            f.last = m;
            f.push(f.last - q);
            if (f.length > 50) {
                f.shift()
            }
            var p = i.systemEnergy();
            if ((p.mean + p.max) / 2 < 0.05) {
                if (h === null) {
                    h = new Date().valueOf()
                }
                if (new Date().valueOf() - h > 1000) {
                    clearInterval(d);
                    d = null
                } else {
                }
            } else {
                h = null
            }
        }, fps: function (n) {
            if (n !== undefined) {
                var q = 1000 / Math.max(1, targetFps);
                j.physicsModified({timeout: q})
            }
            var r = 0;
            for (var p = 0, o = f.length; p < o; p++) {
                r += f[p]
            }
            var m = r / Math.max(1, f.length);
            if (!isNaN(m)) {
                return Math.round(1000 / m)
            } else {
                return 0
            }
        }, start: function (m) {
            if (d !== null) {
                return
            }
            if (g && !m) {
                return
            }
            g = false;
            if (a) {
                i.postMessage({type: "start"})
            } else {
                h = null;
                d = setInterval(j.physicsUpdate, j.system.parameters().timeout)
            }
        }, stop: function () {
            g = true;
            if (a) {
                i.postMessage({type: "stop"})
            } else {
                if (d !== null) {
                    clearInterval(d);
                    d = null
                }
            }
        }};
        return j.init()
    };
    /*      atoms.js */
    var Node = function (a) {
        this._id = _nextNodeId++;
        this.data = a || {};
        this._mass = (a.mass !== undefined) ? a.mass : 1;
        this._fixed = (a.fixed === true) ? true : false;
        this._p = new Point((typeof(a.x) == "number") ? a.x : null, (typeof(a.y) == "number") ? a.y : null);
        delete this.data.x;
        delete this.data.y;
        delete this.data.mass;
        delete this.data.fixed
    };
    var _nextNodeId = 1;
    var Edge = function (b, c, a) {
        this._id = _nextEdgeId--;
        this.source = b;
        this.target = c;
        this.length = (a.length !== undefined) ? a.length : 1;
        this.data = (a !== undefined) ? a : {};
        delete this.data.length
    };
    var _nextEdgeId = -1;
    var Particle = function (a, b) {
        this.p = a;
        this.m = b;
        this.v = new Point(0, 0);
        this.f = new Point(0, 0)
    };
    Particle.prototype.applyForce = function (a) {
        this.f = this.f.add(a.divide(this.m))
    };
    var Spring = function (c, b, d, a) {
        this.point1 = c;
        this.point2 = b;
        this.length = d;
        this.k = a
    };
    Spring.prototype.distanceToParticle = function (a) {
        var c = that.point2.p.subtract(that.point1.p).normalize().normal();
        var b = a.p.subtract(that.point1.p);
        return Math.abs(b.x * c.x + b.y * c.y)
    };
    var Point = function (a, b) {
        if (a && a.hasOwnProperty("y")) {
            b = a.y;
            a = a.x
        }
        this.x = a;
        this.y = b
    };
    Point.random = function (a) {
        a = (a !== undefined) ? a : 5;
        return new Point(2 * a * (Math.random() - 0.5), 2 * a * (Math.random() - 0.5))
    };
    Point.prototype = {exploded: function () {
        return(isNaN(this.x) || isNaN(this.y))
    }, add: function (a) {
        return new Point(this.x + a.x, this.y + a.y)
    }, subtract: function (a) {
        return new Point(this.x - a.x, this.y - a.y)
    }, multiply: function (a) {
        return new Point(this.x * a, this.y * a)
    }, divide: function (a) {
        return new Point(this.x / a, this.y / a)
    }, magnitude: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }, normal: function () {
        return new Point(-this.y, this.x)
    }, normalize: function () {
        return this.divide(this.magnitude())
    }};
    /*     system.js */
    var ParticleSystem = function (d, r, f, g, v, m, s) {
        var k = [];
        var i = null;
        var l = 0;
        var w = null;
        var o = 0.04;
        var j = [20, 20, 20, 20];
        var p = null;
        var q = null;
        if (typeof r == "object") {
            var u = r;
            f = u.friction;
            d = u.repulsion;
            v = u.fps;
            m = u.dt;
            r = u.stiffness;
            g = u.gravity;
            s = u.precision
        }
        f = isNaN(f) ? 0.5 : f;
        d = isNaN(d) ? 1000 : d;
        v = isNaN(v) ? 55 : v;
        r = isNaN(r) ? 600 : r;
        m = isNaN(m) ? 0.02 : m;
        s = isNaN(s) ? 0.6 : s;
        g = (g === true);
        var t = (v !== undefined) ? 1000 / v : 1000 / 50;
        var b = {repulsion: d, stiffness: r, friction: f, dt: m, gravity: g, precision: s, timeout: t};
        var a;
        var c = {renderer: null, tween: null, nodes: {}, edges: {}, adjacency: {}, names: {}, kernel: null};
        var h = {parameters: function (x) {
            if (x !== undefined) {
                if (!isNaN(x.precision)) {
                    x.precision = Math.max(0, Math.min(1, x.precision))
                }
                $.each(b, function (z, y) {
                    if (x[z] !== undefined) {
                        b[z] = x[z]
                    }
                });
                c.kernel.physicsModified(x)
            }
            return b
        }, fps: function (x) {
            if (x === undefined) {
                return c.kernel.fps()
            } else {
                h.parameters({timeout: 1000 / (x || 50)})
            }
        }, start: function () {
            c.kernel.start()
        }, stop: function () {
            c.kernel.stop()
        }, addNode: function (A, D) {
            D = D || {};
            var E = c.names[A];
            if (E) {
                E.data = D;
                return E
            } else {
                if (A != undefined) {
                    var z = (D.x != undefined) ? D.x : null;
                    var F = (D.y != undefined) ? D.y : null;
                    var C = (D.fixed) ? 1 : 0;
                    var B = new Node(D);
                    B.name = A;
                    B._state = c;
                    c.names[A] = B;
                    c.nodes[B._id] = B;
                    k.push({t: "addNode", id: B._id, m: B.mass, x: z, y: F, f: C});
                    h._notify();
                    return B
                }
            }
        }, pruneNode: function (y) {
            var x = h.getNode(y);
            if (typeof(c.nodes[x._id]) !== "undefined") {
                delete c.nodes[x._id];
                delete c.names[x.name]
            }
            $.each(c.edges, function (A, z) {
                if (z.source._id === x._id || z.target._id === x._id) {
                    h.pruneEdge(z)
                }
            });
            k.push({t: "dropNode", id: x._id});
            h._notify()
        }, getNode: function (x) {
            if (x._id !== undefined) {
                return x
            } else {
                if (typeof x == "string" || typeof x == "number") {
                    return c.names[x]
                }
            }
        }, eachNode: function (x) {
            $.each(c.nodes, function (A, z) {
                if (z._p.x == null || z._p.y == null) {
                    return
                }
                var y = (w !== null) ? h.toScreen(z._p) : z._p;
                x.call(h, z, y)
            })
        }, addEdge: function (B, C, A) {
            B = h.getNode(B) || h.addNode(B);
            C = h.getNode(C) || h.addNode(C);
            A = A || {};
            var z = new Edge(B, C, A);
            var D = B._id;
            var E = C._id;
            c.adjacency[D] = c.adjacency[D] || {};
            c.adjacency[D][E] = c.adjacency[D][E] || [];
            var y = (c.adjacency[D][E].length > 0);
            if (y) {
                $.extend(c.adjacency[D][E].data, z.data);
                return
            } else {
                c.edges[z._id] = z;
                c.adjacency[D][E].push(z);
                var x = (z.length !== undefined) ? z.length : 1;
                k.push({t: "addSpring", id: z._id, fm: D, to: E, l: x});
                h._notify()
            }
            return z
        }, pruneEdge: function (C) {
            k.push({t: "dropSpring", id: C._id});
            delete c.edges[C._id];
            for (var z in c.adjacency) {
                for (var D in c.adjacency[z]) {
                    var A = c.adjacency[z][D];
                    for (var B = A.length - 1; B >= 0; B--) {
                        if (c.adjacency[z][D][B]._id === C._id) {
                            c.adjacency[z][D].splice(B, 1)
                        }
                    }
                }
            }
            h._notify()
        }, getEdges: function (y, x) {
            y = h.getNode(y);
            x = h.getNode(x);
            if (!y || !x) {
                return[]
            }
            if (typeof(c.adjacency[y._id]) !== "undefined" && typeof(c.adjacency[y._id][x._id]) !== "undefined") {
                return c.adjacency[y._id][x._id]
            }
            return[]
        }, getEdgesFrom: function (x) {
            x = h.getNode(x);
            if (!x) {
                return[]
            }
            if (typeof(c.adjacency[x._id]) !== "undefined") {
                var y = [];
                $.each(c.adjacency[x._id], function (A, z) {
                    y = y.concat(z)
                });
                return y
            }
            return[]
        }, getEdgesTo: function (x) {
            x = h.getNode(x);
            if (!x) {
                return[]
            }
            var y = [];
            $.each(c.edges, function (A, z) {
                if (z.target == x) {
                    y.push(z)
                }
            });
            return y
        }, eachEdge: function (x) {
            $.each(c.edges, function (B, z) {
                var A = c.nodes[z.source._id]._p;
                var y = c.nodes[z.target._id]._p;
                if (A.x == null || y.x == null) {
                    return
                }
                A = (w !== null) ? h.toScreen(A) : A;
                y = (w !== null) ? h.toScreen(y) : y;
                if (A && y) {
                    x.call(h, z, A, y)
                }
            })
        }, prune: function (y) {
            var x = {dropped: {nodes: [], edges: []}};
            if (y === undefined) {
                $.each(c.nodes, function (A, z) {
                    x.dropped.nodes.push(z);
                    h.pruneNode(z)
                })
            } else {
                h.eachNode(function (A) {
                    var z = y.call(h, A, {from: h.getEdgesFrom(A), to: h.getEdgesTo(A)});
                    if (z) {
                        x.dropped.nodes.push(A);
                        h.pruneNode(A)
                    }
                })
            }
            return x
        }, graft: function (y) {
            var x = {added: {nodes: [], edges: []}};
            if (y.nodes) {
                $.each(y.nodes, function (A, z) {
                    var B = h.getNode(A);
                    if (B) {
                        B.data = z
                    } else {
                        x.added.nodes.push(h.addNode(A, z))
                    }
                    c.kernel.start()
                })
            }
            if (y.edges) {
                $.each(y.edges, function (B, z) {
                    var A = h.getNode(B);
                    if (!A) {
                        x.added.nodes.push(h.addNode(B, {}))
                    }
                    $.each(z, function (F, C) {
                        var E = h.getNode(F);
                        if (!E) {
                            x.added.nodes.push(h.addNode(F, {}))
                        }
                        var D = h.getEdges(B, F);
                        if (D.length > 0) {
                            D[0].data = C
                        } else {
                            x.added.edges.push(h.addEdge(B, F, C))
                        }
                    })
                })
            }
            return x
        }, merge: function (y) {
            var x = {added: {nodes: [], edges: []}, dropped: {nodes: [], edges: []}};
            $.each(c.edges, function (C, B) {
                if ((y.edges[B.source.name] === undefined || y.edges[B.source.name][B.target.name] === undefined)) {
                    h.pruneEdge(B);
                    x.dropped.edges.push(B)
                }
            });
            var A = h.prune(function (C, B) {
                if (y.nodes[C.name] === undefined) {
                    x.dropped.nodes.push(C);
                    return true
                }
            });
            var z = h.graft(y);
            x.added.nodes = x.added.nodes.concat(z.added.nodes);
            x.added.edges = x.added.edges.concat(z.added.edges);
            x.dropped.nodes = x.dropped.nodes.concat(A.dropped.nodes);
            x.dropped.edges = x.dropped.edges.concat(A.dropped.edges);
            return x
        }, tweenNode: function (A, x, z) {
            var y = h.getNode(A);
            if (y) {
                c.tween.to(y, x, z)
            }
        }, tweenEdge: function (y, x, B, A) {
            if (A === undefined) {
                h._tweenEdge(y, x, B)
            } else {
                var z = h.getEdges(y, x);
                $.each(z, function (C, D) {
                    h._tweenEdge(D, B, A)
                })
            }
        }, _tweenEdge: function (y, x, z) {
            if (y && y._id !== undefined) {
                c.tween.to(y, x, z)
            }
        }, _updateGeometry: function (A) {
            if (A != undefined) {
                var x = (A.epoch < l);
                a = A.energy;
                var B = A.geometry;
                if (B !== undefined) {
                    for (var z = 0, y = B.length / 3; z < y; z++) {
                        var C = B[3 * z];
                        if (x && c.nodes[C] == undefined) {
                            continue
                        }
                        c.nodes[C]._p.x = B[3 * z + 1];
                        c.nodes[C]._p.y = B[3 * z + 2]
                    }
                }
            }
        }, screen: function (x) {
            if (x == undefined) {
                return{size: (w) ? objcopy(w) : undefined, padding: j.concat(), step: o}
            }
            if (x.size !== undefined) {
                h.screenSize(x.size.width, x.size.height)
            }
            if (!isNaN(x.step)) {
                h.screenStep(x.step)
            }
            if (x.padding !== undefined) {
                h.screenPadding(x.padding)
            }
        }, screenSize: function (x, y) {
            w = {width: x, height: y};
            h._updateBounds()
        }, screenPadding: function (A, B, x, y) {
            if ($.isArray(A)) {
                trbl = A
            } else {
                trbl = [A, B, x, y]
            }
            var C = trbl[0];
            var z = trbl[1];
            var D = trbl[2];
            if (z === undefined) {
                trbl = [C, C, C, C]
            } else {
                if (D == undefined) {
                    trbl = [C, z, C, z]
                }
            }
            j = trbl
        }, screenStep: function (x) {
            o = x
        }, toScreen: function (z) {
            if (!p || !w) {
                return
            }
            var y = j || [0, 0, 0, 0];
            var x = p.bottomright.subtract(p.topleft);
            var B = y[3] + z.subtract(p.topleft).divide(x.x).x * (w.width - (y[1] + y[3]));
            var A = y[0] + z.subtract(p.topleft).divide(x.y).y * (w.height - (y[0] + y[2]));
            return arbor.Point(B, A)
        }, fromScreen: function (B) {
            if (!p || !w) {
                return
            }
            var A = j || [0, 0, 0, 0];
            var z = p.bottomright.subtract(p.topleft);
            var y = (B.x - A[3]) / (w.width - (A[1] + A[3])) * z.x + p.topleft.x;
            var x = (B.y - A[0]) / (w.height - (A[0] + A[2])) * z.y + p.topleft.y;
            return arbor.Point(y, x)
        }, _updateBounds: function (y) {
            if (w === null) {
                return
            }
            if (y) {
                q = y
            } else {
                q = h.bounds()
            }
            var B = new Point(q.bottomright.x, q.bottomright.y);
            var A = new Point(q.topleft.x, q.topleft.y);
            var D = B.subtract(A);
            var x = A.add(D.divide(2));
            var z = 4;
            var F = new Point(Math.max(D.x, z), Math.max(D.y, z));
            q.topleft = x.subtract(F.divide(2));
            q.bottomright = x.add(F.divide(2));
            if (!p) {
                if ($.isEmptyObject(c.nodes)) {
                    return false
                }
                p = q;
                return true
            }
            var E = o;
            _newBounds = {bottomright: p.bottomright.add(q.bottomright.subtract(p.bottomright).multiply(E)), topleft: p.topleft.add(q.topleft.subtract(p.topleft).multiply(E))};
            var C = new Point(p.topleft.subtract(_newBounds.topleft).magnitude(), p.bottomright.subtract(_newBounds.bottomright).magnitude());
            if (C.x * w.width > 1 || C.y * w.height > 1) {
                p = _newBounds;
                return true
            } else {
                return false
            }
        }, energy: function () {
            return a
        }, bounds: function () {
            var y = null;
            var x = null;
            $.each(c.nodes, function (B, A) {
                if (!y) {
                    y = new Point(A._p);
                    x = new Point(A._p);
                    return
                }
                var z = A._p;
                if (z.x === null || z.y === null) {
                    return
                }
                if (z.x > y.x) {
                    y.x = z.x
                }
                if (z.y > y.y) {
                    y.y = z.y
                }
                if (z.x < x.x) {
                    x.x = z.x
                }
                if (z.y < x.y) {
                    x.y = z.y
                }
            });
            if (y && x) {
                return{bottomright: y, topleft: x}
            } else {
                return{topleft: new Point(-1, -1), bottomright: new Point(1, 1)}
            }
        }, nearest: function (z) {
            if (w !== null) {
                z = h.fromScreen(z)
            }
            var y = {node: null, point: null, distance: null};
            var x = h;
            $.each(c.nodes, function (D, A) {
                var B = A._p;
                if (B.x === null || B.y === null) {
                    return
                }
                var C = B.subtract(z).magnitude();
                if (y.distance === null || C < y.distance) {
                    y = {node: A, point: B, distance: C};
                    if (w !== null) {
                        y.screenPoint = h.toScreen(B)
                    }
                }
            });
            if (y.node) {
                if (w !== null) {
                    y.distance = h.toScreen(y.node.p).subtract(h.toScreen(z)).magnitude()
                }
                return y
            } else {
                return null
            }
        }, _notify: function () {
            if (i === null) {
                l++
            } else {
                clearTimeout(i)
            }
            i = setTimeout(h._synchronize, 20)
        }, _synchronize: function () {
            if (k.length > 0) {
                c.kernel.graphChanged(k);
                k = [];
                i = null
            }
        }};
        c.kernel = Kernel(h);
        c.tween = c.kernel.tween || null;
        var e = (window.__defineGetter__ == null || window.__defineSetter__ == null) ? function (y, x, z) {
            if (!y.hasOwnProperty(x)) {
                Object.defineProperty(y, x, z)
            }
        } : function (y, x, z) {
            if (z.get) {
                y.__defineGetter__(x, z.get)
            }
            if (z.set) {
                y.__defineSetter__(x, z.set)
            }
        };
        var n = function (x) {
            this._n = x;
            this._state = c
        };
        n.prototype = new Point();
        e(n.prototype, "x", {get: function () {
            return this._n._p.x
        }, set: function (x) {
            this._state.kernel.particleModified(this._n._id, {x: x})
        }});
        e(n.prototype, "y", {get: function () {
            return this._n._p.y
        }, set: function (x) {
            this._state.kernel.particleModified(this._n._id, {y: x})
        }});
        e(Node.prototype, "p", {get: function () {
            return new n(this)
        }, set: function (x) {
            this._p.x = x.x;
            this._p.y = x.y;
            this._state.kernel.particleModified(this._id, {x: x.x, y: x.y})
        }});
        e(Node.prototype, "mass", {get: function () {
            return this._mass
        }, set: function (x) {
            this._mass = x;
            this._state.kernel.particleModified(this._id, {m: x})
        }});
        e(Node.prototype, "tempMass", {set: function (x) {
            this._state.kernel.particleModified(this._id, {_m: x})
        }});
        e(Node.prototype, "fixed", {get: function () {
            return this._fixed
        }, set: function (x) {
            this._fixed = x;
            this._state.kernel.particleModified(this._id, {f: x ? 1 : 0})
        }});
        return h
    };
    /* barnes-hut.js */
    var BarnesHutTree = function () {
        var b = [];
        var a = 0;
        var e = null;
        var d = 0.5;
        var c = {init: function (g, h, f) {
            d = f;
            a = 0;
            e = c._newBranch();
            e.origin = g;
            e.size = h.subtract(g)
        }, insert: function (j) {
            var f = e;
            var g = [j];
            while (g.length) {
                var h = g.shift();
                var m = h._m || h.m;
                var p = c._whichQuad(h, f);
                if (f[p] === undefined) {
                    f[p] = h;
                    f.mass += m;
                    if (f.p) {
                        f.p = f.p.add(h.p.multiply(m))
                    } else {
                        f.p = h.p.multiply(m)
                    }
                } else {
                    if ("origin" in f[p]) {
                        f.mass += (m);
                        if (f.p) {
                            f.p = f.p.add(h.p.multiply(m))
                        } else {
                            f.p = h.p.multiply(m)
                        }
                        f = f[p];
                        g.unshift(h)
                    } else {
                        var l = f.size.divide(2);
                        var n = new Point(f.origin);
                        if (p[0] == "s") {
                            n.y += l.y
                        }
                        if (p[1] == "e") {
                            n.x += l.x
                        }
                        var o = f[p];
                        f[p] = c._newBranch();
                        f[p].origin = n;
                        f[p].size = l;
                        f.mass = m;
                        f.p = h.p.multiply(m);
                        f = f[p];
                        if (o.p.x === h.p.x && o.p.y === h.p.y) {
                            var k = l.x * 0.08;
                            var i = l.y * 0.08;
                            o.p.x = Math.min(n.x + l.x, Math.max(n.x, o.p.x - k / 2 + Math.random() * k));
                            o.p.y = Math.min(n.y + l.y, Math.max(n.y, o.p.y - i / 2 + Math.random() * i))
                        }
                        g.push(o);
                        g.unshift(h)
                    }
                }
            }
        }, applyForces: function (m, g) {
            var f = [e];
            while (f.length) {
                node = f.shift();
                if (node === undefined) {
                    continue
                }
                if (m === node) {
                    continue
                }
                if ("f" in node) {
                    var k = m.p.subtract(node.p);
                    var l = Math.max(1, k.magnitude());
                    var i = ((k.magnitude() > 0) ? k : Point.random(1)).normalize();
                    m.applyForce(i.multiply(g * (node._m || node.m)).divide(l * l))
                } else {
                    var j = m.p.subtract(node.p.divide(node.mass)).magnitude();
                    var h = Math.sqrt(node.size.x * node.size.y);
                    if (h / j > d) {
                        f.push(node.ne);
                        f.push(node.nw);
                        f.push(node.se);
                        f.push(node.sw)
                    } else {
                        var k = m.p.subtract(node.p.divide(node.mass));
                        var l = Math.max(1, k.magnitude());
                        var i = ((k.magnitude() > 0) ? k : Point.random(1)).normalize();
                        m.applyForce(i.multiply(g * (node.mass)).divide(l * l))
                    }
                }
            }
        }, _whichQuad: function (i, f) {
            if (i.p.exploded()) {
                return null
            }
            var h = i.p.subtract(f.origin);
            var g = f.size.divide(2);
            if (h.y < g.y) {
                if (h.x < g.x) {
                    return"nw"
                } else {
                    return"ne"
                }
            } else {
                if (h.x < g.x) {
                    return"sw"
                } else {
                    return"se"
                }
            }
        }, _newBranch: function () {
            if (b[a]) {
                var f = b[a];
                f.ne = f.nw = f.se = f.sw = undefined;
                f.mass = 0;
                delete f.p
            } else {
                f = {origin: null, size: null, nw: undefined, ne: undefined, sw: undefined, se: undefined, mass: 0};
                b[a] = f
            }
            a++;
            return f
        }};
        return c
    };
    /*    physics.js */
    var Physics = function (a, m, n, e, h) {
        var f = BarnesHutTree();
        var c = {particles: {}, springs: {}};
        var l = {particles: {}};
        var o = [];
        var k = [];
        var d = 0;
        var b = {sum: 0, max: 0, mean: 0};
        var g = {topleft: new Point(-1, -1), bottomright: new Point(1, 1)};
        var j = 1000;
        var i = {stiffness: (m !== undefined) ? m : 1000, repulsion: (n !== undefined) ? n : 600, friction: (e !== undefined) ? e : 0.3, gravity: false, dt: (a !== undefined) ? a : 0.02, theta: 0.4, init: function () {
            return i
        }, modifyPhysics: function (p) {
            $.each(["stiffness", "repulsion", "friction", "gravity", "dt", "precision"], function (r, s) {
                if (p[s] !== undefined) {
                    if (s == "precision") {
                        i.theta = 1 - p[s];
                        return
                    }
                    i[s] = p[s];
                    if (s == "stiffness") {
                        var q = p[s];
                        $.each(c.springs, function (u, t) {
                            t.k = q
                        })
                    }
                }
            })
        }, addNode: function (u) {
            var t = u.id;
            var q = u.m;
            var p = g.bottomright.x - g.topleft.x;
            var s = g.bottomright.y - g.topleft.y;
            var r = new Point((u.x != null) ? u.x : g.topleft.x + p * Math.random(), (u.y != null) ? u.y : g.topleft.y + s * Math.random());
            c.particles[t] = new Particle(r, q);
            c.particles[t].connections = 0;
            c.particles[t].fixed = (u.f === 1);
            l.particles[t] = c.particles[t];
            o.push(c.particles[t])
        }, dropNode: function (s) {
            var r = s.id;
            var q = c.particles[r];
            var p = $.inArray(q, o);
            if (p > -1) {
                o.splice(p, 1)
            }
            delete c.particles[r];
            delete l.particles[r]
        }, modifyNode: function (r, p) {
            if (r in c.particles) {
                var q = c.particles[r];
                if ("x" in p) {
                    q.p.x = p.x
                }
                if ("y" in p) {
                    q.p.y = p.y
                }
                if ("m" in p) {
                    q.m = p.m
                }
                if ("f" in p) {
                    q.fixed = (p.f === 1)
                }
                if ("_m" in p) {
                    if (q._m === undefined) {
                        q._m = q.m
                    }
                    q.m = p._m
                }
            }
        }, addSpring: function (t) {
            var s = t.id;
            var p = t.l;
            var r = c.particles[t.fm];
            var q = c.particles[t.to];
            if (r !== undefined && q !== undefined) {
                c.springs[s] = new Spring(r, q, p, i.stiffness);
                k.push(c.springs[s]);
                r.connections++;
                q.connections++;
                delete l.particles[t.fm];
                delete l.particles[t.to]
            }
        }, dropSpring: function (s) {
            var r = s.id;
            var q = c.springs[r];
            q.point1.connections--;
            q.point2.connections--;
            var p = $.inArray(q, k);
            if (p > -1) {
                k.splice(p, 1)
            }
            delete c.springs[r]
        }, _update: function (p) {
            d++;
            $.each(p, function (q, r) {
                if (r.t in i) {
                    i[r.t](r)
                }
            });
            return d
        }, tick: function () {
            i.tendParticles();
            i.eulerIntegrator(i.dt);
            i.tock()
        }, tock: function () {
            var p = [];
            $.each(c.particles, function (r, q) {
                p.push(r);
                p.push(q.p.x);
                p.push(q.p.y)
            });
            if (h) {
                h({geometry: p, epoch: d, energy: b, bounds: g})
            }
        }, tendParticles: function () {
            $.each(c.particles, function (q, p) {
                if (p._m !== undefined) {
                    if (Math.abs(p.m - p._m) < 1) {
                        p.m = p._m;
                        delete p._m
                    } else {
                        p.m *= 0.98
                    }
                }
                p.v.x = p.v.y = 0
            })
        }, eulerIntegrator: function (p) {
            if (i.repulsion > 0) {
                if (i.theta > 0) {
                    i.applyBarnesHutRepulsion()
                } else {
                    i.applyBruteForceRepulsion()
                }
            }
            if (i.stiffness > 0) {
                i.applySprings()
            }
            i.applyCenterDrift();
            if (i.gravity) {
                i.applyCenterGravity()
            }
            i.updateVelocity(p);
            i.updatePosition(p)
        }, applyBruteForceRepulsion: function () {
            $.each(c.particles, function (q, p) {
                $.each(c.particles, function (s, r) {
                    if (p !== r) {
                        var u = p.p.subtract(r.p);
                        var v = Math.max(1, u.magnitude());
                        var t = ((u.magnitude() > 0) ? u : Point.random(1)).normalize();
                        p.applyForce(t.multiply(i.repulsion * (r._m || r.m) * 0.5).divide(v * v * 0.5));
                        r.applyForce(t.multiply(i.repulsion * (p._m || p.m) * 0.5).divide(v * v * -0.5))
                    }
                })
            })
        }, applyBarnesHutRepulsion: function () {
            if (!g.topleft || !g.bottomright) {
                return
            }
            var q = new Point(g.bottomright);
            var p = new Point(g.topleft);
            f.init(p, q, i.theta);
            $.each(c.particles, function (s, r) {
                f.insert(r)
            });
            $.each(c.particles, function (s, r) {
                f.applyForces(r, i.repulsion)
            })
        }, applySprings: function () {
            $.each(c.springs, function (t, p) {
                var s = p.point2.p.subtract(p.point1.p);
                var q = p.length - s.magnitude();
                var r = ((s.magnitude() > 0) ? s : Point.random(1)).normalize();
                p.point1.applyForce(r.multiply(p.k * q * -0.5));
                p.point2.applyForce(r.multiply(p.k * q * 0.5))
            })
        }, applyCenterDrift: function () {
            var q = 0;
            var r = new Point(0, 0);
            $.each(c.particles, function (t, s) {
                r.add(s.p);
                q++
            });
            if (q == 0) {
                return
            }
            var p = r.divide(-q);
            $.each(c.particles, function (t, s) {
                s.applyForce(p)
            })
        }, applyCenterGravity: function () {
            $.each(c.particles, function (r, p) {
                var q = p.p.multiply(-1);
                p.applyForce(q.multiply(i.repulsion / 100))
            })
        }, updateVelocity: function (p) {
            $.each(c.particles, function (t, q) {
                if (q.fixed) {
                    q.v = new Point(0, 0);
                    q.f = new Point(0, 0);
                    return
                }
                var s = q.v.magnitude();
                q.v = q.v.add(q.f.multiply(p)).multiply(1 - i.friction);
                q.f.x = q.f.y = 0;
                var r = q.v.magnitude();
                if (r > j) {
                    q.v = q.v.divide(r * r)
                }
            })
        }, updatePosition: function (q) {
            var r = 0, p = 0, u = 0;
            var t = null;
            var s = null;
            $.each(c.particles, function (w, v) {
                v.p = v.p.add(v.v.multiply(q));
                var x = v.v.magnitude();
                var z = x * x;
                r += z;
                p = Math.max(z, p);
                u++;
                if (!t) {
                    t = new Point(v.p.x, v.p.y);
                    s = new Point(v.p.x, v.p.y);
                    return
                }
                var y = v.p;
                if (y.x === null || y.y === null) {
                    return
                }
                if (y.x > t.x) {
                    t.x = y.x
                }
                if (y.y > t.y) {
                    t.y = y.y
                }
                if (y.x < s.x) {
                    s.x = y.x
                }
                if (y.y < s.y) {
                    s.y = y.y
                }
            });
            b = {sum: r, max: p, mean: r / u, n: u};
            g = {topleft: s || new Point(-1, -1), bottomright: t || new Point(1, 1)}
        }, systemEnergy: function (p) {
            return b
        }};
        return i.init()
    };
    var _nearParticle = function (b, c) {
        var c = c || 0;
        var a = b.x;
        var f = b.y;
        var e = c * 2;
        return new Point(a - c + Math.random() * e, f - c + Math.random() * e)
    };

    // if called as a worker thread, set up a run loop for the Physics object and bail out
    if (typeof(window) == 'undefined') return (function () {
        /* hermetic.js */
        $ = {each: function (d, e) {
            if ($.isArray(d)) {
                for (var c = 0, b = d.length; c < b; c++) {
                    e(c, d[c])
                }
            } else {
                for (var a in d) {
                    e(a, d[a])
                }
            }
        }, map: function (a, c) {
            var b = [];
            $.each(a, function (f, e) {
                var d = c(e);
                if (d !== undefined) {
                    b.push(d)
                }
            });
            return b
        }, extend: function (c, b) {
            if (typeof b != "object") {
                return c
            }
            for (var a in b) {
                if (b.hasOwnProperty(a)) {
                    c[a] = b[a]
                }
            }
            return c
        }, isArray: function (a) {
            if (!a) {
                return false
            }
            return(a.constructor.toString().indexOf("Array") != -1)
        }, inArray: function (c, a) {
            for (var d = 0, b = a.length; d < b; d++) {
                if (a[d] === c) {
                    return d
                }
            }
            return -1
        }, isEmptyObject: function (a) {
            if (typeof a !== "object") {
                return false
            }
            var b = true;
            $.each(a, function (c, d) {
                b = false
            });
            return b
        }, };
        /*     worker.js */
        var PhysicsWorker = function () {
            var b = 20;
            var a = null;
            var d = null;
            var c = null;
            var g = [];
            var f = new Date().valueOf();
            var e = {init: function (h) {
                e.timeout(h.timeout);
                a = Physics(h.dt, h.stiffness, h.repulsion, h.friction, e.tock);
                return e
            }, timeout: function (h) {
                if (h != b) {
                    b = h;
                    if (d !== null) {
                        e.stop();
                        e.go()
                    }
                }
            }, go: function () {
                if (d !== null) {
                    return
                }
                c = null;
                d = setInterval(e.tick, b)
            }, stop: function () {
                if (d === null) {
                    return
                }
                clearInterval(d);
                d = null
            }, tick: function () {
                a.tick();
                var h = a.systemEnergy();
                if ((h.mean + h.max) / 2 < 0.05) {
                    if (c === null) {
                        c = new Date().valueOf()
                    }
                    if (new Date().valueOf() - c > 1000) {
                        e.stop()
                    } else {
                    }
                } else {
                    c = null
                }
            }, tock: function (h) {
                h.type = "geometry";
                postMessage(h)
            }, modifyNode: function (i, h) {
                a.modifyNode(i, h);
                e.go()
            }, modifyPhysics: function (h) {
                a.modifyPhysics(h)
            }, update: function (h) {
                var i = a._update(h)
            }};
            return e
        };
        var physics = PhysicsWorker();
        onmessage = function (a) {
            if (!a.data.type) {
                postMessage("¿kérnèl?");
                return
            }
            if (a.data.type == "physics") {
                var b = a.data.physics;
                physics.init(a.data.physics);
                return
            }
            switch (a.data.type) {
                case"modify":
                    physics.modifyNode(a.data.id, a.data.mods);
                    break;
                case"changes":
                    physics.update(a.data.changes);
                    physics.go();
                    break;
                case"start":
                    physics.go();
                    break;
                case"stop":
                    physics.stop();
                    break;
                case"sys":
                    var b = a.data.param || {};
                    if (!isNaN(b.timeout)) {
                        physics.timeout(b.timeout)
                    }
                    physics.modifyPhysics(b);
                    physics.go();
                    break
            }
        };
    })()


    arbor = (typeof(arbor) !== 'undefined') ? arbor : {}
    $.extend(arbor, {
        // object constructors (don't use ‘new’, just call them)
        ParticleSystem: ParticleSystem,
        Point: function (x, y) {
            return new Point(x, y)
        },

        // immutable object with useful methods
        etc: {
            trace: trace,              // ƒ(msg) -> safe console logging
            dirname: dirname,          // ƒ(path) -> leading part of path
            basename: basename,        // ƒ(path) -> trailing part of path
            ordinalize: ordinalize,    // ƒ(num) -> abbrev integers (and add commas)
            objcopy: objcopy,          // ƒ(old) -> clone an object
            objcmp: objcmp,            // ƒ(a, b, strict_ordering) -> t/f comparison
            objkeys: objkeys,          // ƒ(obj) -> array of all keys in obj
            objmerge: objmerge,        // ƒ(dst, src) -> like $.extend but non-destructive
            uniq: uniq,                // ƒ(arr) -> array of unique items in arr
            arbor_path: arbor_path,    // ƒ() -> guess the directory of the lib code
        }
    })

})(this.jQuery)