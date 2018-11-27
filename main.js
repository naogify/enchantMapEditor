window.onload = function() {
	enchant();
	var stage = document.getElementById('enchant-stage');
	stage.appendChild(mapForm.create());
	document.getElementById('checkbox').checked = true;
}
var app = {};
app.maps= {};
app.imagePath = '';
app.typeEdit = true;
app.extendMode = false;
app.editFunc = 'change';
app.selectedLayer = 0;
app.selectedType = 0;
app.selectedData = 0;
app.mapWidth = 0;
app.mapHeight = 0;

var mapForm = {
	widthBox: (function() {
		var element = document.createElement('input');
		element.type = 'text';
		element.id = 'widthBox';
		return element;
	})(),
	heightBox: (function() {
		var element = document.createElement('input');                               
		element.type = 'text';
		element.id = 'heightBox';                                                
		return element;
	})(),
	imageMenu: (function() {
		var element = document.createElement('select');
		element.id = 'select';
		element.options[0] = new Option('RPG', 'map0.gif');
		element.options[1] = new Option('2D Scroll', 'map1.gif');
		return element;
	})(),
	extendOption: (function() {
		var element = document.createElement('input');
		element.type = 'checkbox';
		element.id = 'checkbox';
		return element;
	})(),
	acceptButton: (function() {
		var element = document.createElement('input');                            
		element.type = 'button';                                              
		element.value = '作成 (Create)';
		element.onclick = function() {
			var w = document.getElementById('widthBox');
			var h = document.getElementById('heightBox');                               
			var img = document.getElementById('select');
			var ex = document.getElementById('checkbox');
			var wv = parseInt(w.value, 10);                                             
			var hv = parseInt(h.value, 10);
			var iv = img.options[img.selectedIndex].value;
			var ev = ex.checked;
			app.extendMode = ev;
			app.imagePath = iv;
			if (!(isNaN(wv)) && !(isNaN(hv))) {
				var edit = document.getElementById('edit');
				app.image = document.createElement('img');
				app.image.src = iv;
				app.mapWidth = wv;
				app.mapHeight = hv;
				app.image.onload = function() {
					if (app.extendMode && this.width != 256 || this.height != 256) {
						alert('256x256pxの画像を使用してください (Use 256x256 Image)');
						return;
					}
					start(wv, hv, iv, ev);
					edit.innerHTML+= '矢印キーでスクロール (Push Arrow Key to Scroll)';
					editorTabs.initialize();
					edit.appendChild(editorTabs.element);
					edit.appendChild(icons.create());
					var d = document.createElement('div');
					d.appendChild(palette);
					edit.appendChild(d);
					var d2 = document.createElement('div');
					d2.appendChild(geneButton);
					d2.appendChild(loadButton);
					edit.appendChild(d2);
					palette.loadImage(app.image);
				};
			} else {
				alert("input number");                                                  
			}                                                                          
		};                     
		return element;
	})(),
	create: function() {
		var form = document.createElement('div');
		form.innerHTML += '横幅(Width) : ';
		form.appendChild(this.widthBox);
		form.innerHTML += '<br />縦幅(Height) : ';
		form.appendChild(this.heightBox);
		form.innerHTML += '<br />画像(Image): ';
		form.appendChild(this.imageMenu);
		form.innerHTML += '<br />マップ拡張を有効にする(Enable Map Extension)';
		form.appendChild(this.extendOption);
		form.innerHTML += '<br />';
		form.appendChild(this.acceptButton);
		return form;
	}
};

var editorTabs = {
	tabs: [],
	element: (function() {
		var element = document.createElement('div');
		element.id = 'tabs';
		element.style.width = '360px';
		element.style.height = '0px';
		return element;
	})(),
	initialize: function() {
		this.element.appendChild(this.addTabButton);
		this.addNewTab('coltab', '判定');
		this.addNewTab('bgtab1', 'tab1', true);
		this.addNewTab('bgtab2', 'tab2');
		this.applyColors();
	},
	addNewTab: function(id, name, active) {
		var element = document.createElement('div');
		element.style.width = '84px';
		element.style.height = '20px';
		element.style.float = 'left';
		element.style['text-align'] = 'center';
		element.id = id;
		element.innerText = name;
		if (active) {
			element.isActive = true;
		} else {
			element.isActive = false;
		}
		element.tabNum = this.element.childNodes.length - 2;
		element.onclick = function() {
			app.selectedLayer = this.tabNum;
			editorTabs.changeActive();
		};
		this.element.insertBefore(element, this.addTabButton);
		if (this.element.childNodes.length % 4 == 2) {
			var height = this.element.style.height;
			this.element.style.height = parseInt(height) + 20 + 'px';
		}
	},
	addTabButton: (function() {
		var element = document.createElement('div');
		element.id = 'addTabButton';
		element.style.width = '20px';
		element.style.height = '20px';
		element.style.float = 'left';
		element.style.backgroundColor = 'rgb(85,85,85)',
		element.style['text-align'] = 'center';
		element.innerText = '+';
		return element;
	})(),
	applyColors: function() {
		var data = this.element.childNodes;
		for (var i = 0, l = data.length; i < l; i++) {
			if (data[i].isActive) {
				data[i].style.backgroundColor = 'rgb(51, 85, 119)';
				data[i].style.color = 'rgb(0, 0, 0)';
			} else {
				data[i].style.backgroundColor = 'rgb(85, 85, 85)';
				data[i].style.color = 'rgb(119, 119, 119)';
			}
		}
	},
	changeActive: function() {
		var data = this.element.childNodes;
		for (var i = 0, l = data.length; i < l; i++) {
			data[i].isActive = false;
		}
		data[app.selectedLayer+1].isActive = true;
		this.applyColors();
	}
};

var palette = (function() {
	var element = document.createElement('canvas');
	element.width = 256;
	element.height = 256;
	element.loadImage = function(image) {
		if (image.width > this.width) {
			this.width = image.width;
		} 
		if (image.height > this.height) {
			this.height = image.height;
		}
		var ctx = this.getContext('2d');
		ctx.drawImage(image, 0, 0, this.width, this.height);
	};
	element.onclick = function(e) {
		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;
		var cols = Math.floor(this.width / 16);
		x = Math.floor(x / 16) | 0;
		y = Math.floor(y / 16) | 0;
		if (app.extendMode) {
			if (x < 6) {
				app.selectedType = Math.floor(x / 3) + Math.floor(y / 4) * 2;
				app.typeEdit = true;
				x = Math.floor(x / 3) * 3;
				y = Math.floor(y / 4) * 4 + 1;
				icons.updateStat(app.image, x*16, y*16, 48, 48);
			} else if (x < 11) {
				app.selectedData = x - 6 + 12 + y * 17;
				app.typeEdit = false;
				icons.updateStat(app.image, x*16, y*16);
			} else {
				app.selectedData = x - 11 + 12 + 272 + y * 17;
				app.typeEdit = false;
				icons.updateStat(app.image, x*16, y*16);
			}

		}
		else {
			app.selectedData = x + y * cols;
			icons.updateStat(app.image, x*16, y*16);
		}
	};
	return element;
})();

var icons = (function() {
	var element = document.createElement('canvas');
	element.id = 'rectIcon';
	element.width = 336;
	element.height = 48;
	element.draw = function() {
		var ctx = this.getContext('2d');
		//
		ctx.clearRect(48, 0, this.width - 48, this.height);
		ctx.font = '20px helvetica';
		ctx.fillText('-1', 48*1 + 8, 32); 
		//
		ctx.fillText('pen', 48*2 + 8, 32); 
		//
		ctx.fillText('fill', 48*3 + 8, 32); 
		//
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'Black';
		ctx.beginPath();
		ctx.moveTo(48*4 +  5, 10);
		ctx.lineTo(48*4 + 43, 38);
		ctx.stroke();

		ctx.fillRect(48*5 +  8, 12, 36, 24);
		//
		ctx.fillRect(48*6 +  8, 8, 32, 10);
		ctx.fillRect(48*6 + 30, 18, 10, 22);
		ctx.fillRect(48*6 + 24, 30, 16, 10);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(48*6 + 24, 25);
		ctx.lineTo(48*6 + 24, 45);
		ctx.lineTo(48*6 + 14, 35);
		ctx.lineTo(48*6 + 24, 25);
		ctx.fill();
	};
	element.drawFrame = function(num) {
		var ctx = this.getContext('2d');
		ctx.strokeStyle = 'Red';
		ctx.strokeRect(num * 48, 0, 48, 48);
	};
	element.onclick = function(e) {
		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;
		var i = Math.floor(x / 48);
		if (i > 1 && i < 6) {
			this.draw();
			this.drawFrame(i);
		}
		this.func[i]();
	};
	element.updateStat = function(image, x, y, width, height) {
		var ctx = this.getContext('2d');
		ctx.clearRect(0, 0, 48, 48);
		ctx.drawImage(image, x, y, width|16, height|16, 0, 0, 48, 48);
	};
	element.clearMode = function() {
		var ctx = this.getContext('2d');
		ctx.clearRect(0, 0, 48, 48);
		ctx.lineWidth = 1; 
		ctx.strokeStyle = 'Red';
		ctx.strokeRect(1, 1, 46, 46);
		ctx.beginPath();
		ctx.moveTo(2, 2);
		ctx.lineTo(46, 46);
		ctx.stroke();
	};
	element.func = {};
	return element;
})();
icons.create = function() {
	var element = document.createElement('div');
	element.style.height = '48px';
	this.draw();
	if (app.extendMode) {
		this.updateStat(app.image, 0, 16, 48, 48);
	} else {
		this.updateStat(app.image, 0, 0);
	}
	element.appendChild(this);
	return element;
};

var geneButton = (function() {
	var element = document.createElement('input');
	element.type = 'button';
	element.id = 'geneButton';
	element.value = 'コード生成';
	element.onclick = function() {
		var txt = '';
		var w = window.open('about:blank', '_blank');
		var output = document.createElement('textarea');
		app.maps.bgMap.collisionData = app.maps.colMap._data[0];
		output.rows = 30;
		output.cols = 120;
		txt += app.maps.bgMap.getDataCode('backgroundMap', app.imagePath);

        //マップタイルの数値に対応していないので、フィルターにかける
        const replaced = txt

        //配列の途中の数字にマッチ
        // [か,にマッチしたものを、$1に代入している。

        //森
            .replace(/([\[,])382(?!\d)/g, '$1' + '131')//森（1本）
            .replace(/([\[,])360(?!\d)/g, '$1' + '131')//森（1本）
            .replace(/([\[,])377(?!\d)/g, '$1' + '131')//森（1本）
            .replace(/([\[,])394(?!\d)/g, '$1' + '131')//森（1本）

			.replace(/([\[,])342(?!\d)/g, '$1' + '321')//森（3本真ん中）
            .replace(/([\[,])343(?!\d)/g, '$1' + '322')//森（3本右端）

            .replace(/([\[,])361(?!\d)/g, '$1' + '340')//森（複数上左端）
            .replace(/([\[,])363(?!\d)/g, '$1' + '342')//森（複数上右端）

			.replace(/([\[,])378(?!\d)/g, '$1' + '356')//森（複数左端）
            .replace(/([\[,])379(?!\d)/g, '$1' + '357')//森（複数真ん中）
            .replace(/([\[,])380(?!\d)/g, '$1' + '358')//森（複数右端）

            .replace(/([\[,])395(?!\d)/g, '$1' + '372')//森（複数下左端）
            .replace(/([\[,])396(?!\d)/g, '$1' + '373')//森（複数下真ん中）
            .replace(/([\[,])397(?!\d)/g, '$1' + '374')//森（複数下右端）


        //地面
            .replace(/([\[,])241(?!\d)/g, '$1' + '291')//地面左右（枠）
            .replace(/([\[,])221(?!\d)/g, '$1' + '272')//地面左上（枠）
            .replace(/([\[,])255(?!\d)/g, '$1' + '304')//地面左下（枠）
            .replace(/([\[,])223(?!\d)/g, '$1' + '274')//地面右上（枠）

            .replace(/([\[,])226(?!\d)/g, '$1' + '277')//地面上
            .replace(/([\[,])260(?!\d)/g, '$1' + '309')//地面下
            .replace(/([\[,])242(?!\d)/g, '$1' + '292')//地面左
            .replace(/([\[,])244(?!\d)/g, '$1' + '294')//地面右
            .replace(/([\[,])243(?!\d)/g, '$1' + '293')//地面中
            .replace(/([\[,])225(?!\d)/g, '$1' + '276')//地面左上
            .replace(/([\[,])259(?!\d)/g, '$1' + '308')//地面左下
            .replace(/([\[,])227(?!\d)/g, '$1' + '278')//地面右上
            .replace(/([\[,])261(?!\d)/g, '$1' + '310')//地面右下

            .replace(/([\[,])205(?!\d)/g, '$1' + '256')//地面左（横棒）
            .replace(/([\[,])224(?!\d)/g, '$1' + '275')//地面上（縦棒）
            .replace(/([\[,])241(?!\d)/g, '$1' + '291')//地面中（縦棒）
            .replace(/([\[,])246(?!\d)/g, '$1' + '259')//地面（点）

            //水（島有り）
            .replace(/([\[,])2(?!\d)/g, '$1' + '385')//水上下（島）

            .replace(/([\[,])37(?!\d)/g, '$1' + '419')//水左右（島）
            .replace(/([\[,])17(?!\d)/g, '$1' + '400')//水左上角（島）
            .replace(/([\[,])51(?!\d)/g, '$1' + '432')//水左下角（島）
            .replace(/([\[,])53(?!\d)/g, '$1' + '434')//水右下角（島）
            .replace(/([\[,])19(?!\d)/g, '$1' + '402')//水右上角（島）

            // //水（島なし）
            .replace(/([\[,])22(?!\d)/g, '$1' + '405')//水上
            .replace(/([\[,])56(?!\d)/g, '$1' + '437')//水下
            .replace(/([\[,])38(?!\d)/g, '$1' + '420')//水左
            .replace(/([\[,])40(?!\d)/g, '$1' + '422')//水右
            .replace(/([\[,])21(?!\d)/g, '$1' + '404')//水左上
            .replace(/([\[,])55(?!\d)/g, '$1' + '436')//水左下
            .replace(/([\[,])23(?!\d)/g, '$1' + '406')//水右上
            .replace(/([\[,])57(?!\d)/g, '$1' + '438')//水右下

            //水（縦棒）
            .replace(/([\[,])20(?!\d)/g, '$1' + '403')//水縦上
            .replace(/([\[,])37(?!\d)/g, '$1' + '419')//水縦中
            .replace(/([\[,])54(?!\d)/g, '$1' + '435')//水縦中

			.replace(/([\[,])39(?!\d)/g, '$1' + '0')//水
            .replace(/([\[,])12(?!\d)/g, '$1' + '6')//岩 影なし
            .replace(/([\[,])13(?!\d)/g, '$1' + '7')//石壁 影なし
            .replace(/([\[,])29(?!\d)/g, '$1' + '22')//岩 影あり
            .replace(/([\[,])46(?!\d)/g, '$1' + '38')//テーブル
            .replace(/([\[,])30(?!\d)/g, '$1' + '23')//石壁 影あり
            .replace(/([\[,])284(?!\d)/g, '$1' + '11')//壺
            .replace(/([\[,])285(?!\d)/g, '$1' + '12')//茶色いもっこり
            .replace(/([\[,])286(?!\d)/g, '$1' + '13')//階段
            .replace(/([\[,])301(?!\d)/g, '$1' + '27')//宝箱
            .replace(/([\[,])302(?!\d)/g, '$1' + '28')//お花
            .replace(/([\[,])303(?!\d)/g, '$1' + '29')//下がる階段
            .replace(/([\[,])318(?!\d)/g, '$1' + '43')//ろうそく
            .replace(/([\[,])319(?!\d)/g, '$1' + '44')//穴
            .replace(/([\[,])335(?!\d)/g, '$1' + '59')//看板上半分
            .replace(/([\[,])336(?!\d)/g, '$1' + '60')//大木左上
            .replace(/([\[,])337(?!\d)/g, '$1' + '61')//大木右上
            .replace(/([\[,])352(?!\d)/g, '$1' + '75')//看板下半分
            .replace(/([\[,])353(?!\d)/g, '$1' + '76')//大木左下
            .replace(/([\[,])354(?!\d)/g, '$1' + '77')//大木右下
            .replace(/([\[,])369(?!\d)/g, '$1' + '91')//お城
            .replace(/([\[,])370(?!\d)/g, '$1' + '92')//町
            .replace(/([\[,])371(?!\d)/g, '$1' + '93')//ダンジョン入り口

            //水（点）
            .replace(/([\[,])42(?!\d)/g, '$1' + '387')//水縦中


			//これより下のセットはこの順番で実行する。
            .replace(/([\[,])320(?!\d)/g, '$1' + '45')//半分石壁
            .replace(/([\[,])341(?!\d)/g, '$1' + '320')//森（3本左端）
            .replace(/([\[,])362(?!\d)/g, '$1' + '341')//森（複数上真ん中）

            //水（横棒）
            .replace(/([\[,])1(?!\d)/g, '$1' + '384')//水左
            .replace(/([\[,])107(?!\d)/g, '$1' + '1')//草

            .replace(/([\[,])386(?!\d)/g, '$1' + '107')//小さな木
            .replace(/([\[,])3(?!\d)/g, '$1' + '386')//水左（横棒）

            .replace(/([\[,])257(?!\d)/g, '$1' + '306')//地面右下（枠）
            .replace(/([\[,])206(?!\d)/g, '$1' + '257')//地面上下（枠）

            .replace(/([\[,])258(?!\d)/g, '$1' + '307')//地面下（縦棒）
            .replace(/([\[,])207(?!\d)/g, '$1' + '258');//地面右（横棒）


        console.log(replaced);
        output.value = replaced;
        w.document.body.appendChild(output);
	};
	return element;
})();

var loadButton = (function() {
	var element = document.createElement('input');
	element.type = 'button';
	element.id = 'loadButton';
	element.value = 'コード読み込み (Code Import)';
	element.onclick = function() {
		var w = window.open('about:blank', '_blank');
		var input = document.createElement('textarea');
		input.id = 'load';
		input.rows = 30;
		input.cols = 120;
		var accept = document.createElement('input');
		accept.type = 'button';
		accept.value = '読み込み (Import)';
		accept.type = 'button';
		accept.onclick = function() {
			try {
				eval(w.document.getElementById('load').value);
			} catch (e) {
				console.log(e);
				alert(e);
			}
			app.mapWidth = backgroundMap._data[0][0].length;
			app.mapHeight = backgroundMap._data[0].length;
			app.maps.colMap.loadData(backgroundMap.collisionData);
			var length = backgroundMap._data.length;
			var tabs = document.getElementById('tabs');
			var num = tabs.childNodes.length - 2;
			if (length < num) {
				for (var i = num; i > length; i--) {
					tabs.removeChild(tabs.childNodes[tabs.childNodes.length - 2]);
				}
			} else if (length > num) {
				for (var i = num; i < length; i++) {
					editorTabs.addNewTab('bgtab' + i, 'layer' + i);
				}
			}
			app.frame.changeSize(app.mapWidth, app.mapHeight);
			editorTabs.applyColors();
			w.close();
		};
		w.document.body.appendChild(input);
		w.document.body.innerHTML += '<br />';
		w.document.body.appendChild(accept);
		w.document.getElementById('load').value += '// example \n// backGround.loadData([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);';
	};
	return element;
})();
