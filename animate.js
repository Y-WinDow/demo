(function (){
	function getStyle(ele, prop) {
		var style = ele.currentStyle || window.getComputedStyle(ele, '');
		if(prop === 'opacity' && navigator.userAgent.indexOf('MSIE') != -1 && !window.addEventListener)// ie6-8 opacity 补丁
			if (ele.style.filter && ele.style.filter != 'none') {
				return ele.style.filter.match(/\d+/g)[0];
			} else {
				return 1;
			}
		return style[prop];
	}
	function setStyle(ele, props){
		for (var prop in props) {
			if(prop === 'opacity' && navigator.userAgent.indexOf('MSIE') != -1 && !window.addEventListener)// ie6-8 opacity 补丁
				ele.style.filter = 'alpha(' + prop + '=' + props[prop].value*100 + ')';
			else ele.style[prop] = props[prop].value + props[prop].unit;
		}
	}

	var Animate = function (options){
		this.init(options);
	};
	Animate.prototype.init = function (options){
		this.initElements(options);
	};
	Animate.prototype.initElements = function (options){
		this.ele = options.ele;
		this.duration = options.duration || 100;
	};
	Animate.prototype.getStepLength = function (props){
		this.stepLength = {};
		this.endProp = {};
		this.originalProp = {};

		var pattern = /^([\+\-]?\d*\.?\d+)(\w*)$/;
		for(var prop in props){
			var tempCurrentProp = getStyle(this.ele,prop);
			if(tempCurrentProp === undefined) continue; // 如果当前属性不是合法的css属性则不进入动画。

			var currentEndProp = props[prop];
			if(!pattern.test(tempCurrentProp)){ // 处理非 【数值+单位】 的属性值 不纳入实际步长中。
				this.endProp[prop] = {
					value:props[prop],
					unit:''
				}
				this.originalProp[prop] = {
					value:tempCurrentProp,
					unit:''
				}
			} else { // 处理 【数值+单位】 的属性值
				var tempEndArr = pattern.exec(currentEndProp),
					tempCurrentArr = pattern.exec(tempCurrentProp),
					unit = tempCurrentArr[2] || '';

				this.endProp[prop] = {
					value:Number(tempEndArr[1]),
					unit:unit
				}
				this.stepLength[prop] = {
					value:Number(tempEndArr[1]) - Number(tempCurrentArr[1]),
					unit:unit
				}
				this.originalProp[prop] = {
					value:Number(tempCurrentArr[1]),
					unit:unit
				}
			}
		}
	};
	Animate.prototype.animate = function (){
		var self = this;
		var startTime = new Date().getTime();
		this.timer = setTimeout(function (){
			var currentTime = new Date().getTime(),
				goneTime = currentTime - startTime;

			if(goneTime >= self.duration){
				setStyle(self.ele, self.endProp);
				clearTimeout(self.timer);
				return;
			}

			var currentStepLength = {};
			for(var i in self.stepLength){
				currentStepLength[i] = {};
				currentStepLength[i].value = self.originalProp[i].value + goneTime / self.duration * self.stepLength[i].value,
				currentStepLength[i].unit =  self.stepLength[i].unit;
			}
			setStyle(self.ele, currentStepLength);

			self.timer = setTimeout(arguments.callee,16);
		},16);
	};
	Animate.prototype.stop = function (){
		if(!this.timer) return;
		clearTimeout(this.timer);
	};
	Animate.prototype.goto = function (props, duration){
		if(this.timer) clearTimeout(this.timer);
		this.getStepLength(props);
		this.duration = duration || this.duration;
		this.animate();
	};
	window.Animate = Animate;
})();
