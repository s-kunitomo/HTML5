
onload = function () {
	var c = document.getElementById("canvas");
	c.width = 500;
	c.height = 500;

	var gl = c.getContext("webgl");

	// canvasを初期化する色を設定する
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// canvasを初期化する際の震度をせっているする
	gl.clearDepth(1.0);

	// canvasを初期化する
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// ===================================================================
	// シェーダのコンパイル
	// ===================================================================
	// 頂点シェーダとフラグメントシェーダの生成
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	// プログラムオブジェクトの生成とリンク
	var prg = create_program(v_shader, f_shader);

	// ===================================================================
	// モデルデータを用意／頂点バッファ( VBO )の生成と通知
	// ===================================================================
	// attributeLocationの取得
	var attLocation = gl.getAttribLocation(prg, 'position');

	// attributeの要素数(この場合は xyz の3要素)
	var attStride = 3;

	// モデルデータ
	var vertex_position = [
		0.0, 1.0, 0.0,
		1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	];

	// VBOの生成
	var vbo = create_vbo(vertex_position);

	// VBOをバインド
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	// attribute属性を有効にする
	gl.enableVertexAttribArray(attLocation);

	// attribute属性を登録
	gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

	// ===================================================================
	// 座標変換行列の生成と通知
	// ===================================================================
	var m = new matIV();

	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());

	m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, mvpMatrix);
	m.multiply(mvpMatrix, mMatrix, mvpMatrix);

	var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
	gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

	// ===================================================================
	// モデルの描画とコンテキストの再描画
	// ===================================================================
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	gl.flush();

	function create_shader(id) {
		// シェーダを格納する変数
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

		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;	
		} else {
			console.log(gl.getShaderInfoLog(shader));
		}
	}

	// プログラムオブジェクトを生成しシェーダをリンクする関数
	function create_program(vs, fs) {
		// プログラムオブジェクトの生成
		var program = gl.createProgram();

		// プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		// シェーダをリンク
		gl.linkProgram(program);

		// シェーダのリンクが正しく行われたかをチェック
		if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
			// 成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);

			// プログラムオブジェクトを返して終了
			return program;
		} else {
			// 失敗していたらエラーログをアラートする
			console.log(gl.getProgramInfoLog(program));
		}
	}

	function create_vbo(data) {
		// バッファオブジェクトの生成
		var vbo = gl.createBuffer();

		// 
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

		// バッファのバインドを初期化
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// 生成したvboを返して終了
		return vbo;
	}

};

