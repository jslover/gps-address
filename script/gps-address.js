﻿/**
* @Static
* @description 获取当前位置gps坐标及地址名称
* @author http://jslover.com
* @version 1.0  2012.12.6
*/
(function ($) {
    //位置服务相关JS
    $.GpsAddress = {
        //获取标准经纬坐标
        getCurrentPosition:function(callback){
            if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition)
            {
                alert('浏览器不支持坐标定位');
                return;
            }
            //html5获取当前gps坐标
            navigator.geolocation.getCurrentPosition(function(position){                    
                callback && callback({
                    longitude:position.coords.longitude
                    ,latitude:position.coords.latitude
                });                
            });           
        }       
        //根据标准经纬坐标获取baidu坐标
        ,getBaiduPointFromGPS:function(longitude,latitude,callback){
            var _this = this;
            //先加载必要的JS
            if(!_this.loadedMap){
                //动态加载baiduAPI所需要的JS
                $.getScript('http://api.map.baidu.com/getscript?v=1.4&key=&services=&t=20121205061315',function(data){
                     _this.loadedMap = true;
                     //加载完毕重新执行当前方法                   
                    _this.getBaiduPointFromGPS(longitude,latitude,callback);
                });
                return;
            }
            //随机函数名
            var callbackName = 'tmp_cbk_' + Math.round(Math.random() * 10000);    
            //转换坐标的异步接口
            var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from=0&to=4&x=" + longitude + "&y=" + latitude + "&callback=$." + callbackName;
            //临时回调
            $[callbackName] = function(xyResult){
                //调用完需要删除改函数
                delete $[callbackName];    
                var point = new BMap.Point(xyResult.x, xyResult.y);
                callback && callback(point);
            }
            //通过script方式执行接口
            $.getScript(xyUrl);
        }
        //获取baidu坐标的地址
        ,getAddressFromBaiduPoint:function(point,callback){
            var _this = this;
            if(!_this.baiduGC){
                _this.baiduGC = new BMap.Geocoder();
            }
            //baidu坐标->地址信息
            _this.baiduGC.getLocation(point, function(rs){                               
                callback && callback(rs.address);
            });
        }
        //获取标准经纬坐标的地址
        ,getAddressFromGps:function(longitude,latitude,callback){
            var _this = this;          
            _this.getBaiduPointFromGPS(longitude,latitude,function(point){
                _this.getAddressFromBaiduPoint(point,callback);         
            });
        }        
        //获取标准经纬坐标及地址
        ,getCurentPositionAndAddress:function(callback){
            var result = {};
            var _this = this;
            _this.getCurrentPosition(function(data){     
                result.longitude = data.longitude;
                result.latitude = data.latitude;
                _this.getAddressFromGps(result.longitude,result.latitude,function(data){
                   result.address = data;
                   callback && callback(result);
                });           
            });
        }
    }
})(jQuery);