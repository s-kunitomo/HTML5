
var canvas;
var gl;
var json;

window.onload = function() {
	xhr('../ModelData/bunny.json');
}

function xhr(file){
	var x = new XMLHttpRequest();
	x.open('GET', file);
	x.onreadystatechange = function(){
		if(x.readyState == 4){
			json = JSON.parse(x.responseText);
			renderer();
		}
	}
	x.send();
}

function renderer() {
	var canvas = document.getElementById('screen');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	var prg = create_program(v_shader, f_shader);

	// =========================================================
	// 
	// =========================================================
	var pos = create_vbo(json.position);
	var nor = create_vbo(json.normal);
	var idx = create_ibo(json.index);
	var indexLength = json.index.length;
	var bufferList = [pos, nor];

	// =========================================================
	// 
	// =========================================================
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[3] = gl.getUniformLocation(prg, 'skyDirection');
	uniLocation[4] = gl.getUniformLocation(prg, 'lightDirection');
	uniLocation[5] = gl.getUniformLocation(prg, 'eyePosition');
	uniLocation[6] = gl.getUniformLocation(prg, 'skyColor');
	uniLocation[7] = gl.getUniformLocation(prg, 'groundColor');

	var m = new matIV();
	var mMatrix    = m.identity(m.create());
	var vMatrix    = m.identity(m.create());
	var pMatrix    = m.identity(m.create());
	var tmpMatrix  = m.identity(m.create());
	var mvpMatrix  = m.identity(m.create());
	var invMatrix  = m.identity(m.create());

	var eyePosition = [0.0, 0.0, 20.0];

	m.lookAt(eyePosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
	m.perspective(45, canvas.width / canvas.height, 0.1, 50.0, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);

	var lightDirection = [-0.5, 0.5, 0.5];
	var eyeDirection = [0.0, 0.0, 20.0];
	var ambientColor = [0.1, 0.1, 0.1, 1.0];

	var skyDirection = [0.0, 1.0, 0.0];
	var lightDirection = [-0.577, 0.577, 0.577];
	var skyColor = [0.1, 0.2, 0.5, 1.0];
	var groundColor = [0.2, 0.2, 0.0, 1.0];

	var count = 0;

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);

	(function () {
		count++;

		var rad = (count % 360) * Math.PI / 180;

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		set_attribute(bufferList, attLocation, attStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);

		m.identity(mMatrix);

		m.translate(mMatrix, [0.0, -5.0, 0.0], mMatrix);
		m.rotate(mMatrix, Math.PI * 0.05, [1.0, 0.0, 0.0], mMatrix);
		m.rotate(mMatrix, rad, [0.0, 1.0, 0.0], mMatrix);

		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);

		gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
		gl.uniform3fv(uniLocation[3], skyDirection);
		gl.uniform3fv(uniLocation[4], lightDirection);
		gl.uniform3fv(uniLocation[5], eyePosition);
		gl.uniform4fv(uniLocation[6], skyColor);
		gl.uniform4fv(uniLocation[7], groundColor);

		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

		gl.flush();

		setTimeout(arguments.callee, 1000 / 30);

	})();

	function create_shader(id) {
		var shader;

		var scriptElement = document.getElementById(id);

		if (!scriptElement) { return; }

		switch(scriptElement.type) {
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default:
				return;
		}

		gl.shaderSource(shader, scriptElement.text);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;
		} else {
			console.log(gl.getShaderInfoLog(shader));
		}
	}

	function create_program (vs, fs) {
		var program = gl.createProgram();

		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
			gl.useProgram(program);
			return program;
		} else {
			console.log(gl.getProgramInfoLog(program));
		}
	}

	function create_vbo(data) {
		var vbo = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		return vbo;
	}

	function set_attribute(vbo, attL, attS) {
		for(var i in vbo) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			gl.enableVertexAttribArray(attL[i]);
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}

	function create_ibo(data) {
		var ibo = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return ibo;
	}

	function torus(row, column, irad, orad){
		var pos = new Array(), nor = new Array(),
            col = new Array(), idx = new Array();
        for(var i = 0; i <= row; i++){
            var r = Math.PI * 2 / row * i;
            var rr = Math.cos(r);
            var ry = Math.sin(r);
            for(var ii = 0; ii <= column; ii++){
                var tr = Math.PI * 2 / column * ii;
                var tx = (rr * irad + orad) * Math.cos(tr);
                var ty = ry * irad;
                var tz = (rr * irad + orad) * Math.sin(tr);
                var rx = rr * Math.cos(tr);
                var rz = rr * Math.sin(tr);
                pos.push(tx, ty, tz);
                nor.push(rx, ry, rz);
                var tc = hsva(360 / column * ii, 1, 1, 1);
                col.push(tc[0], tc[1], tc[2], tc[3]);
            }
        }
        for(i = 0; i < row; i++){
            for(ii = 0; ii < column; ii++){
                r = (column + 1) * i + ii;
                idx.push(r, r + column + 1, r + 1);
                idx.push(r + column + 1, r + column + 2, r + 1);
            }
        }
        return [pos, nor, col, idx];
	}
	
	// HSV から RGB への変換を行なう関数
	function hsva(h, s, v, a){
		if(s > 1 || v > 1 || a > 1){return;}
		var th = h % 360;
		var i = Math.floor(th / 60);
		var f = th / 60 - i;
		var m = v * (1 - s);
		var n = v * (1 - s * f);
		var k = v * (1 - s * (1 - f));
		var color = new Array();
		if(!s > 0 && !s < 0){
			color.push(v, v, v, a); 
		} else {
			var r = new Array(v, n, m, m, k, v);
			var g = new Array(k, v, v, n, m, m);
			var b = new Array(m, m, k, v, v, n);
			color.push(r[i], g[i], b[i], a);
		}
		return color;
	}
};
