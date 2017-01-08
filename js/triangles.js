this.Widget = this.Widget||{};
(function(){
	/**
	 * 初始化三角形组件
	 * @param {Object组件容器选择符，同css选择符} boxElement
	 */
	function triangles(boxElement){
		//canvas
		this.canvas = document.createElement("canvas");
		//组件容器
		this.boxElement = document.querySelector(boxElement);
		//组件配置参数
		this.config = null;
		//组件数据
		this.dataProvider = null;
		//组件通信事件触发器
		this.EventDispatcher = $({});
		//显示对象地图
		this.nodeMap = null;
        this.boxElement.appendChild(this.canvas);
        this.stage = new createjs.Stage(this.canvas);
        this.stage.enableMouseOver(10);
        this.stage.cursor = "pointer";
        createjs.Touch.enable(this.stage);
        createjs.Ticker.on("tick",this.stage);
        //动画
        this.AnimateObj = null;
	};
	var p = triangles.prototype;
	/**
	 * 初始化组件配置
	 * @param {Object组件配置参数} config
	 */
	p.setConfig = function(config){
		this.config = config;
	}
	/**
	 * 数据发生改变时，需要重新创建元素
	 * @param {Object组件数据} data
	 */
	p.setDataProvider = function(data){
		this.dataProvider = data;
		//初始化组件显示对象
		this._createContent();
	}
	/**
     * 初始化组件尺寸或resize时调用
     * @param size 最新尺寸：{width: 100, height: 100}
     */
    p.resize = function(size)
    {
    	this.canvas.width = size.width;
    	this.canvas.height = size.height;
    	this._layout();
    }
    /**
     * 初始化组件显示对象
     */
    p._createContent = function(){
    	if (this.config == null || this.dataProvider == null) return;
    	//每次都清空显示对象列表
    	//引用给nodeMap，每次this.nodeMap太麻烦了
    	var nodeMap = this.nodeMap = {};
    	this.AnimateObj = null;
    	this.stage.removeAllChildren();
    	var cur = this;
    	//总容器
    	nodeMap.containers = new createjs.Container();
    	//背景
    	nodeMap.background = new createjs.Shape();
    	//左侧数值容器
    	nodeMap.axisX = new createjs.Container();
    	//下边文字容器
    	nodeMap.TextCon = new createjs.Container();
    	//三角形容器
    	nodeMap.trianglesCon = new createjs.Container();
    	this.stage.addChild(nodeMap.containers);
    	nodeMap.containers.addChild(nodeMap.background);
    	nodeMap.containers.addChild(nodeMap.axisX);
    	nodeMap.containers.addChild(nodeMap.TextCon);
    	nodeMap.containers.addChild(nodeMap.trianglesCon);
    	//计算最大值
    	this.dataProvider.sort(function(a,b){
    		return b[cur.config.valueField] - a[cur.config.valueField];
    	});
    	this.config.maxValue = Handleunit(this.dataProvider[0][this.config.valueField]);
    	this.config.unit = this.config.maxValue.slice(-1);
    	this.config.numResult = numlines(this.config.maxValue.slice(0,-1),0,6);
    	for (var i = 0; i <= this.config.numResult.cornumber; i++) {
    		var numText = new createjs.Text(this.config.numResult.tmpstep*i,this.config.fontStyle,this.config.fontdefaultColor);
    		numText.index = i;
    		numText.textAlign = "right";
    		numText.type = "numText";
    		numText.textBaseline = "middle";
    		nodeMap.axisX.addChild(numText);
    	}
    	var nuitPrompt = new createjs.Text("单位："+this.config.unit+"",this.config.fontStyle,this.config.fontdefaultColor);
    	nuitPrompt.type = nuitPrompt.name = "nuitPrompt";
    	nuitPrompt.textAlign = "center";
    	nodeMap.axisX.addChild(nuitPrompt);
    	var pointLine = new createjs.Shape();
    	pointLine.type = pointLine.name = "pointLine";
    	nodeMap.axisX.addChild(pointLine);
    	for (var i = 0; i < this.dataProvider.length; i++) {
    		var txtName = new createjs.Text(this.dataProvider[i][this.config.labelField],this.config.fontStyle,this.config.fontdefaultColor);
			var triangles = new createjs.Shape();
			txtName.textAlign = "right";
			triangles.tips = this.dataProvider[i];
			triangles.txtName = txtName;
			nodeMap.TextCon.addChild(txtName);
			nodeMap.trianglesCon.addChild(triangles);
    	}
    	this._layout();
    }
    //显示对象布局
    p._layout = function(){
    	if (this.config == null || this.dataProvider == null) return;
    	var cur = this;
    	var nodeMap = this.nodeMap;
    	nodeMap.axisX.x = this.config.left;
    	nodeMap.TextCon.x = nodeMap.background.x = nodeMap.trianglesCon.x = nodeMap.axisX.x + 20;
    	nodeMap.axisX.y = nodeMap.background.y = nodeMap.TextCon.y = nodeMap.trianglesCon.y = this.canvas.height - this.config.bottom;
    	nodeMap.background.graphics.clear().setStrokeStyle(this.config.backgroundLineWidth).beginStroke(this.config.backgroundLineColor);
    	var tolHeight = this.canvas.height - this.config.bottom - this.config.top;
    	var lineHeight = tolHeight/this.config.numResult.cornumber;
    	var lineWidth = (this.canvas.width-nodeMap.background.x-5)/(this.dataProvider.length+1);
    	var nuitPrompt = nodeMap.axisX.getChildByName("nuitPrompt");
    	var pointLine = nodeMap.axisX.getChildByName("pointLine");
    	pointLine.graphics.clear().setStrokeStyle(1).beginStroke(this.config.linepointer);
    	for (var i = 0; i < nodeMap.axisX.children.length; i++) {
    		if(nodeMap.axisX.children[i].type=="numText"){
    			nodeMap.axisX.children[i].y = -nodeMap.axisX.children[i].index * lineHeight;
    			pointLine.graphics.rect(5,nodeMap.axisX.children[i].y,1,1);
    			nodeMap.background.graphics.moveTo(0,nodeMap.axisX.children[i].y).lineTo(this.canvas.width-nodeMap.background.x-5,nodeMap.axisX.children[i].y);
    		}
    	}
    	nuitPrompt.y = -this.config.numResult.cornumber * lineHeight-25;
    	var actualHeight = tolHeight * this.config.maxValue.slice(0,-1)/this.config.numResult.cormax;
    	for (var i = 0; i < this.dataProvider.length; i++) {
    		var scale = this.dataProvider[i][this.config.valueField]/this.dataProvider[0][this.config.valueField];
    		nodeMap.background.graphics.moveTo(lineWidth*i,0).lineTo(lineWidth*i,-tolHeight);
    		var triangles = nodeMap.trianglesCon.children[i];
    		triangles.graphics.clear();
    		triangles.graphics.setStrokeStyle(1);
    		triangles.graphics.beginStroke(this.config.linepointer).rect(lineWidth*(i+1)-1,0,2,2);
    		triangles.fillCommand = triangles.graphics.beginFill(this.config.fillColor).command;
    		triangles.strokeCommand = triangles.graphics.beginStroke(this.config.borderColor).command;
    		triangles.graphics.moveTo(lineWidth*(i+1),0).lineTo(lineWidth*(i+1)-lineWidth/3,0).lineTo(lineWidth*(i+1),-(actualHeight*scale<20?20:actualHeight*scale)).lineTo(lineWidth*(i+1)+lineWidth/3,0);
    		triangles.scaleY = 0;
    		nodeMap.TextCon.children[i].x = lineWidth*(i+1);
    		nodeMap.TextCon.children[i].y = 10;
    		nodeMap.TextCon.children[i].rotation = this.config.rotation;
    	}
    	nodeMap.background.graphics.moveTo(lineWidth*i,0).lineTo(lineWidth*i,-tolHeight);
    	nodeMap.background.graphics.moveTo(lineWidth*(i+1),0).lineTo(lineWidth*(i+1),-tolHeight);
    	this._events();
    	this._Animate();
    }
    //事件
    p._events = function(){
    	var cur = this;
    	this.nodeMap.trianglesCon.on("mouseover",function(e){
    		e.target.fillCommand.style = e.target.strokeCommand.style = cur.config.HighlightColor;
    		e.target.txtName.color = cur.config.fontHighlightColor;
    		var argObj = {
    			tips:e.target.tips,
    			x:e.stageX,
    			y:e.stageY
    		}
    		cur.EventDispatcher.trigger("WIDGET_OVER",argObj);
    	});
    	this.nodeMap.trianglesCon.on("mouseout",function(e){
    		e.target.fillCommand.style = cur.config.fillColor;
    		e.target.strokeCommand.style = cur.config.borderColor;
    		e.target.txtName.color = cur.config.fontdefaultColor;
    		cur.EventDispatcher.trigger("WIDGET_OUT");
    	});
    }
    //动画
    p._Animate = function(){
    	var cur = this;
    	for (var i = 0; i < this.nodeMap.trianglesCon.children.length; i++) {
    		TweenMax.to(this.nodeMap.trianglesCon.children[i],1,{
				scaleY:1,
				delay:0.1*i,
				ease:"linear"
			});
    	}
    }
    /**
     * @param {Object} 数字
     * @param {Object} 单位
     */
    function Handleunit(num,unit){
    	var format = ['百千万亿兆京垓秭'.split(''), [100, 10, 10, 1e4, 1e4, 1e4, 1e4, 1e4]],
    		power = 1,
	        texts = format[0],
	        powers = format[1],
	        loop = 0,
	        result = num;
	        while (1) {
		      power = powers[loop]
		      if (num >= power && loop < texts.length){
		      	num /= power;
		      }else{
		      	var units = unit ? unit : '';
		        res = loop === 0 ? num+units : num + texts[loop - 1]+units;
		        break;
		      }
		      ++loop;
		    }
    	return res;
    }
    /**
     *
     * [numlines 计算步长方法]
     * @param  {[number]} cormax [最大值]
     * @param  {[number]} cormin [最小值(包括0)]
     * @param  {[number]} cornumber [刻度个数]
     * @return {[object]} [cormax, cormin, cornumber, tmpstep] [最大值，最小值，个数，步长]
     */
	function numlines(cormax, cormin, cornumber) {

		var tmpmax, tmpmin, corstep, tmpstep, tmpnumber, temp, extranumber;
		if(cormax <= cormin)
			return;
		corstep = (cormax - cormin) / cornumber;
		if(Math.pow(10, parseInt(Math.log(corstep) / Math.log(10))) == corstep) {
			temp = Math.pow(10, parseInt(Math.log(corstep) / Math.log(10)));
		} else {
			temp = Math.pow(10, (parseInt(Math.log(corstep) / Math.log(10)) + 1));
		}
		tmpstep = (corstep / temp).toFixed(6);
		//选取规范步长
		if(tmpstep >= 0 && tmpstep <= 0.1) {
			tmpstep = 0.1;
		} else if(tmpstep >= 0.100001 && tmpstep <= 0.2) {
			tmpstep = 0.2;
		} else if(tmpstep >= 0.200001 && tmpstep <= 0.25) {
			tmpstep = 0.25;
		} else if(tmpstep >= 0.250001 && tmpstep <= 0.5) {
			tmpstep = 0.5
		} else {
			tmpstep = 1;
		}
		tmpstep = tmpstep * temp;
		if(parseInt(cormin / tmpstep) != (cormin / tmpstep)) {
			if(cormin < 0) {
				cormin = (-1) * Math.ceil(Math.abs(cormin / tmpstep)) * tmpstep;
			} else {
				cormin = parseInt(Math.abs(cormin / tmpstep)) * tmpstep;
			}
		}
		if(parseInt(cormax / tmpstep) != (cormax / tmpstep)) {
			cormax = parseInt(cormax / tmpstep + 1) * tmpstep;
		}
		tmpnumber = (cormax - cormin) / tmpstep;
		if(tmpnumber < cornumber) {
			extranumber = cornumber - tmpnumber;
			tmpnumber = cornumber;
			if(extranumber % 2 == 0) {
				cormax = cormax + tmpstep * parseInt(extranumber / 2);
			} else {
				cormax = cormax + tmpstep * parseInt(extranumber / 2 + 1);
			}
			cormin = cormin - tmpstep * parseInt(extranumber / 2);
		}
		cornumber = tmpnumber;
		//最大值，最小值，个数，步长
 		return {
            cormax:cormax,
            cormin:cormin,
            cornumber:cornumber,
            tmpstep:tmpstep
        };
	}
	this.Widget.triangles = triangles;
})();
