var DungeonMapper = DungeonMapper || (function(){
    'use strict';
 
    var version = 0.1,
    columnNum = 3, // Number of columns to render
    massDuplicateTokenName = "DungeonMapperDuplicateToken", // Token name to paste tokens to.
    massDuplicateTokenPath = "8733117/PjxpbDj12pW8i5RU_VkNAg/thumb.png?1428566975", // Image to represent token.
    defaultTexture = 'Old School',
    restrictedWalls = '#FF0000',
    leadingURL = 'https://s3.amazonaws.com/files.d20.io/images/',

    mainDivStyle = ' style="border: 1px solid black; background-color: white; padding: 0px 0px;"',
    tablDivStyle = ' style="display: table;"',
    trowDivStyle = ' style="display: table-row;"',
    cellDivStyle = ' style="display: table-cell; border-collapse: collapse; padding-left: 0px; padding-right: 0px;"',
    atagOneStyle = ' style="border: 1px solid AliceBlue; background-color: SteelBlue; color: white;"',
    atagTwoStyle = ' style="border: 1px solid AliceBlue; background-color: DarkCyan; color: white;"',
    atagThrStyle = ' style="border: 1px solid AliceBlue; background-color: Maroon; color: white;"',
    imagDivStyle = ' style="padding: 0px 0px 0px 0px; outline: none; border: none;"',
    spanOneStyle = ' style="color:white; font-weight:normal; display:block; width: ' + (columnNum*75) + 'px;"',
    spanTwoStyle = ' style="color:LemonChiffon; font-weight:normal; display:block; width: ' + (columnNum*75) + 'px;"',
    
    pathDataArray = [
        {pathCSV: '000,001,002,003,004,700,701',         path: [[0,-1],[0,141]]},
        {pathCSV: '001,003,004,006,007,700,701',         path: [[-1,0],[141,0]]},
        {pathCSV: '005,006,007,009,010,011,008',         path: [[-1,141],[1,139]]},
        {pathCSV: '002,003,004,007,700,701',             path: [[140,-1],[140,141]]},
        {pathCSV: '004',                                 path: [[-1,140],[141,140]]},
        {pathCSV: '008,010,011,508,510,511',             path: [[-1,-1],[1,1]]},
        {pathCSV: '009,010,011',                         path: [[141,-1],[139,1]]},
        {pathCSV: '011',                                 path: [[141,141],[139,139]]},
        {pathCSV: '200,201,202,203,204,205,206',         path: [[0,281],[0,-1]]},
        {pathCSV: '201,203,204,205,209,211',             path: [[-1,0],[281,0]]},
        {pathCSV: '202,203,204,206,207',                 path: [[280,-1],[280,281]]},
        {pathCSV: '204,209',                             path: [[281,280],[-1,280]]},
        {pathCSV: '205',                                 path: [[139,280],[281,280]]},
        {pathCSV: '205',                                 path: [[280,281],[280,139]]},
        {pathCSV: '206,207,208,501,503,504,506,507',     path: [[-1,0],[71,0]]},
        {pathCSV: '206,207,208',                         path: [[281,0],[209,0]]},
        {pathCSV: '206,207,208',                         path: [[-1,280],[71,280]]},
        {pathCSV: '206,207,208',                         path: [[281,280],[209,280]]},
        {pathCSV: '207,208,210,211,500,501,502,503,504', path: [[0,-1],[0,71]]},
        {pathCSV: '207,208,210,211',                     path: [[0,281],[0,209]]},
        {pathCSV: '208',                                 path: [[280,-1],[280,71]]},
        {pathCSV: '208',                                 path: [[280,281],[280,209]]},
        {pathCSV: '209',                                 path: [[0,-1],[0,141]]},
        {pathCSV: '209',                                 path: [[280,-1],[280,141]]},
        {pathCSV: '209',                                 path: [[140,281],[139,140]]},
        {pathCSV: '502,503,504,507',                     path: [[70,-1],[71,70]]},
        {pathCSV: '504',                                 path: [[-1,70],[71,70]]},
        {pathCSV: '505,506,507,508,509,510,511',         path: [[-1,71],[1,69]]},
        {pathCSV: '509,510,511',                         path: [[71,-1],[69,1]]},
        {pathCSV: '511',                                 path: [[71,71],[69,69]]},
        {pathCSV: '900,901',                             path: [[60,65],[140,65],[140,70]]},
    ],
    
    moduleMacros = [
        {istokenaction: true,   action: '!rght_5',     name: '->>|'},
        {istokenaction: true,   action: '!rght_1',     name: '->|'},
        {istokenaction: true,   action: '!left_1',     name: '|<-'},
        {istokenaction: true,   action: '!left_5',     name: '|<<-'},
        {istokenaction: true,   action: '!h_flip',     name: '↔Flip-Horizontal'},
        {istokenaction: true,   action: '!v_flip',     name: '↕Flip-Vertical'},
        {istokenaction: true,   action: '!left90',     name: '↶Turn-Left-90-Degrees'},
        {istokenaction: true,   action: '!rght90',     name: '↷Turn-Right-90-Degrees'},
        {istokenaction: true,   action: '!trn180',     name: '↻Turn-180-Degrees'},
        {istokenaction: true,   action: '!double',     name: '▓»▓-Paste-Selected'},
        {istokenaction: false,  action: '!mainmenu',   name: '♦1-Dungeon-Mapper-Menu'},
    ],
    
    installedTextures,
 
    handleInput = function(msg) {
        var msg, args, obj, playerid;
        msg = _.clone(msg);
        if ( 'api' !== msg.type ) {return; }
        args = msg.content.split(/\s+/);
        obj =  _.first(msg.selected);
        playerid = msg.playerid;
        switch(args[0]) {
            case '!DungeonMapper': setupDungeonMapper(playerid); return; 
            case '!DungeonMapperRemove': removepDungeonMapper(); return;
            case '!DungeonMapperPack0': refreshDefaut(); return;
            case '!mainmenu': mainmenu(); return; 
            case '!walls10x10': subMenu(1,'Walls 10x10',2); return;
            case '!doors10x10': subMenu(2,'Doors 10x10',2); return;
            case '!light5x5': subMenu(3,'Lights 5x5',1); return;
            case '!walls20x20': subMenu(4,'Walls 20x20',4); return;
            case '!walls5x5': subMenu(0,'Walls 5x5',1); return;
            case '!stairs10x10': subMenu(5,'Stairs 10x10',2); return;
            case '!packSelect': packSelect(); return;
            case '!toggleTokenAction': toggleTokenAction(); return;
            case '!texture': changeTexture(msg); return;
            case '!tileNumber': addTile(msg,'add'); return;
            case '!rght90': rotateTile(msg, 90); return; 
            case '!left90': rotateTile(msg, -90); return; 
            case '!trn180': rotateTile(msg, 180); return; 
            case '!v_flip': flipTile(msg, 'V'); return; 
            case '!h_flip': flipTile(msg, 'H'); return; 
            case '!left_1': chooseTile(msg, 'L', 1); return;
            case '!left_5': chooseTile(msg, 'L', 5); return;
            case '!rght_1': chooseTile(msg, 'R', 1);  return;
            case '!rght_5': chooseTile(msg, 'R', 5); return;
            case '!double': addTile(msg,'pste'); return;
	    case '!spawnDuplicateToken': spawnDuplicateToken(msg); return;
        }
    },
    
    handleGraphicChange = function(obj) {
        var locatedPaths, locatedTile, imgsrcTruncated, value, featurePathArray, n, args, packName, packKey;
        args = obj.get('name').split('|');
        if(2 !== args.length){
            return;
        }
        packName = args[0].replace("_"," ");
        packKey = args[1];
        imgsrcTruncated = obj.get('imgsrc').replace(leadingURL,'');
        locatedTile = _.where(DungeonMapperTextures[packName], {urlValue: imgsrcTruncated});
        if (locatedTile.length === 0) { 
            return;
        }
        locatedPaths = findObjs({                                                          
            _type: 'path',
            controlledby: obj.get('_id')
        });
        _.each(locatedPaths, function(eachPath) {
            if (eachPath.length !== 0) { 
                eachPath.remove();
            }
        });
        value = locatedTile[0].pathKey;
        featurePathArray = new Array();
        _.each(pathDataArray, function(pathDataArrayEach) {
            n = pathDataArrayEach.pathCSV.indexOf(value)
            if(n != -1){
                featurePathArray.push({
                    width: obj.get('width'),
                    height: obj.get('height'),
                    top: obj.get('top'),
                    left: obj.get('left'),
                    rotation: obj.get('rotation'),
                    fliph: obj.get('fliph'),
                    flipv: obj.get('flipv'),
                    path: pathDataArrayEach.path,
                    stroke: restrictedWalls,
                    strokewidth: 3,
                    forID: obj.get('_id')
                });
            }
        });
        if("900" === packKey || "901" === packKey){
            featurePathArray.push({
                width: obj.get('width'),
                height: obj.get('height'),
                top: obj.get('top'),
                left: obj.get('left'),
                rotation: obj.get('rotation'),
                fliph: obj.get('fliph'),
                flipv: obj.get('flipv'),
                path: [[0,70],[0,65],[60,65]],
                stroke: '#FFFF00',
                strokewidth: 3,
                forID: obj.get('_id')
            });
        }
        if("900" === packKey || "901" === packKey){
            featurePathArray.push({
                width: obj.get('width'),
                height: obj.get('height'),
                top: obj.get('top'),
                left: obj.get('left'),
                rotation: obj.get('rotation'),
                fliph: obj.get('fliph'),
                flipv: obj.get('flipv'),
                path: [[60,65],[55,70],[60,120]],
                stroke: '#00FF00',
                strokewidth: 3,
                forID: obj.get('_id')
            });
        }
        if("902" === packKey || "903" === packKey){
            featurePathArray.push({
                width: obj.get('width'),
                height: obj.get('height'),
                top: obj.get('top'),
                left: obj.get('left'),
                rotation: obj.get('rotation'),
                fliph: obj.get('fliph'),
                flipv: obj.get('flipv'),
                path: [[0,70],[0,65],[140,65],[140,70]],
                stroke: '#FFFF00',
                strokewidth: 3,
                forID: obj.get('_id')
            });
        }
        if("902" === packKey || "903" === packKey){
            featurePathArray.push({
                width: obj.get('width'),
                height: obj.get('height'),
                top: obj.get('top'),
                left: obj.get('left'),
                rotation: obj.get('rotation'),
                fliph: obj.get('fliph'),
                flipv: obj.get('flipv'),
                path: [[0,70],[0,65],[15,65],[25,128]],
                stroke: '#00FF00',
                strokewidth: 3,
                forID: obj.get('_id')
            });
            featurePathArray.push({
                width: obj.get('width'),
                height: obj.get('height'),
                top: obj.get('top'),
                left: obj.get('left'),
                rotation: obj.get('rotation'),
                fliph: obj.get('fliph'),
                flipv: obj.get('flipv'),
                path: [[140,70],[140,65],[125,65],[115,128]],
                stroke: '#00FF00',
                strokewidth: 3,
                forID: obj.get('_id')
            });
        }
        placeRotatedFlipPaths(featurePathArray);
        toFront(obj);
    },
    
    handleGraphicDestroy = function(obj) {
        var locatedPaths, locatedTile, imgsrcTruncated, args, packName, packKey;
        args = obj.get('name').split('|');
        if(2 !== args.length){
            return;
        }
        packName = args[0].replace("_"," ");
        packKey = args[1];
        imgsrcTruncated = obj.get('imgsrc').replace(leadingURL,'')
        locatedTile = _.where(DungeonMapperTextures[packName], {urlValue: imgsrcTruncated});
        if (locatedTile.length === 0) { 
            return;
        }
        locatedPaths = findObjs({                                                          
            _type: 'path',
            controlledby: obj.get('_id')
        });
        _.each(locatedPaths, function(eachPath) {
            if (eachPath.length !== 0) { 
                eachPath.remove();
            }
        });
    },
    
    changeTexture = function(msg) {
        var textureSelected = msg.content.replace('!texture ' ,'');
        state.currentTexture = DungeonMapperTextures[textureSelected];
        state.currentTextureName = textureSelected;
        sendChat('Texture Set to', '/direct "' + textureSelected + '.');
    },
    
    rotateTile = function(msg, degree) {
        var selectedObjs = msg.selected, obj =  _.first(selectedObjs), token;
        if (obj._type == 'graphic') {
            token = getObj('graphic', obj._id);              
            token.set({rotation: token.get('rotation') + degree});        
        }
        handleGraphicChange(token);
    },
    
    flipTile = function(msg, direction) {
        var selectedObjs = msg.selected, obj =  _.first(selectedObjs), token;
        if ('graphic' === obj._type) {
            token = getObj('graphic', obj._id);
            token.set({
                fliph: 'H' === direction ? !token.get('fliph') : token.get('fliph'),
                flipv: 'H' !== direction ? !token.get('flipv') : token.get('flipv')
            });
        }
        handleGraphicChange(token);
    },
    
    chooseTile = function(msg, direction, step) {
        var selectedObjs = msg.selected, obj =  _.first(selectedObjs), token, sideArray, currentSide, newURL, findFeature,
            imgsrcTruncated, locatedTile, args, packName;
        if ('graphic' === obj._type) {
            token = getObj('graphic', obj._id);
            if((token.get('sides') != '') && (token.get('imgsrc').indexOf('thumb.') > -1)){
                token = getObj('graphic', obj._id);
                sideArray = token.get('sides').split('|');
                currentSide = token.get('currentSide');
                if (direction == 'L') {
                    currentSide = currentSide - step;
                    if (currentSide < 0 ) { currentSide = sideArray.length + currentSide; }
                }
                if (direction == 'R') {
                    currentSide = currentSide + step;
                    if (currentSide > (sideArray.length - 1) ) { currentSide = currentSide - sideArray.length; }
                }
                newURL = sideArray[currentSide];
                token.set({'imgsrc': newURL, 'currentSide': currentSide});
                args = token.get('name').split('|');
                packName = args[0].replace("_"," ");
                imgsrcTruncated = token.get('imgsrc').replace(leadingURL,'');
                locatedTile = _.where(DungeonMapperTextures[packName], {urlValue: imgsrcTruncated});
                token.set({'height': locatedTile[0].height, 'width': locatedTile[0].width});
                handleGraphicChange(token);
            }
        }
    },
    
    spawnDuplicateToken = function(msg) {
	// Clean up old tokens
	var tokens = findObjs({ _type: 'graphic', name: massDuplicateTokenName});
	for(var i=0;i<tokens.length;i++) {
	    tokens[i].remove();
	}
	//
	var currentPageId = Campaign().get('playerpageid');
        var newGraphic = createObj('graphic', {
            type: 'graphic', 
            subtype: 'token', 
            pageid: currentPageId, 
            layer: "gmlayer", 
            width: 70,
            height: 70,
            left: 70, 
            top: 70, 
            imgsrc: leadingURL + massDuplicateTokenPath,
            name: massDuplicateTokenName,
        });
    },

    addTile = function(msg,action) {
        var message, value, currentPage, center, middle, sideString, selectedObjs, obj, token,
            eachBlueTile, currentPageId, featurePathArray, pathList, newGraphic, name, layer,
            light_radius, light_dimradius, light_otherplayers, underscoreName, featureState, featureId,
            sideExclude = '800,801,802,803,900,901,902,903,904,905,880,881';
        currentPageId = Campaign().get('playerpageid');
        underscoreName = state.currentTextureName.replace(' ','_');
        layer = 'map';
        currentPage = findObjs({
            _id: currentPageId,                              
            _type: 'page'                          
        });

	var targetToken = findObjs({ _type: 'graphic', name: massDuplicateTokenName});
	if (targetToken.length != 1) {
	    targetToken = null;
	}
	else {
	    targetToken = targetToken[0];
	}

        if('pste' === action){
            selectedObjs = msg.selected;
	    // find offsets
	    var xOff = 999999, yOff = 999999;
	    for(var i=0;i<selectedObjs.length;i++) {
		obj =  selectedObjs[i];
		if ('graphic' === obj._type) {
                    token = getObj('graphic', obj._id);
		    if (token.get("left") < xOff)
			xOff = token.get("left");
		    if (token.get("top") < yOff)
			yOff = token.get("top");
		}
	    }
            for(var i=0;i<selectedObjs.length;i++) {
		obj =  selectedObjs[i];
		if ('graphic' === obj._type) {
                    token = getObj('graphic', obj._id);
		}
		var top, left;
		if (targetToken) {
		    top = Math.round(targetToken.get("top") + token.get("top") - yOff);
		    left = Math.round(targetToken.get("left") + token.get("left") - xOff);
		}
		else {
		    top = Math.round(token.get("top") + 45);
		    left = Math.round(token.get("left") + 45);
		}
		sendChat("API", "Token " + token.get("name") + "(" + i +"):" + Math.round(token.get("left") - xOff) + ","+Math.round(token.get("top") - yOff));
		newGraphic = createObj('graphic', {
                    type: 'graphic', 
                    subtype: 'token', 
                    pageid: currentPageId, 
                    layer: token.get('layer'),
                    width: token.get('width'),
                    height: token.get('height'),
                    left: left, 
                    top: top, 
                    imgsrc: token.get('imgsrc'),
                    rotation: token.get('rotation'),
                    flipv: token.get('flipv'),
                    fliph: token.get('fliph'),
                    sides: token.get('sides'),
                    currentSide: token.get('currentSide'),
                    light_radius: token.get('light_radius'),
                    light_dimradius: token.get('light_dimradius'),
                    light_otherplayers: token.get('light_otherplayers'),
                    name: token.get('name')
		});
	    }
            return;
        }else{
            message = msg.content.split(' ');
            value = message[1].toLowerCase();
            center = Math.floor(currentPage[0].get('width') / 2) * 70;
            middle = Math.floor(currentPage[0].get('height') / 2) * 70;
            sideString = '';
            _.each(state.currentTexture, function(eachBlueTile) {
                sideString += leadingURL + eachBlueTile.urlValue + '|'; 
            });
            sideString = sideString.slice(0,-1);
            name = underscoreName + '|' + state.currentTexture[value].pathKey;
            layer = 'map';
            newGraphic = createObj('graphic', {
                type: 'graphic', 
                subtype: 'token', 
                pageid: currentPageId, 
                layer: layer, 
                width: state.currentTexture[value].width, 
                height: state.currentTexture[value].height,
                left: center, 
                top: middle, 
                imgsrc: leadingURL + state.currentTexture[value].urlValue, 
                sides: sideString,
                currentSide: value,
                name: name,
            });
        }
        if(-1 !== sideExclude.indexOf(state.currentTexture[value].pathKey)){
            featureId = newGraphic.get('_id');
    		layer = 'objects';
            light_radius = '';
            light_dimradius = '';
            light_otherplayers = '';
            switch(state.currentTexture[value].pathKey) {
                case '801': 
					light_radius = 60;
                    light_dimradius = 40;
                    light_otherplayers = true;
                    break;
                case '803': 
					light_radius = 60;
                    light_dimradius = 40;
                    light_otherplayers = true;
                    break;
                case '881': 
					light_radius = 60;
                    light_dimradius = 40;
                    light_otherplayers = true;
                    break;
            }
            newGraphic.set({
                gmnotes: featureId,
                layer: layer,
                light_radius: light_radius,
                light_dimradius: light_dimradius,
                light_otherplayers: light_otherplayers,
                sides: '', 
                currentSide: ''
            });
        }  
    },

    placeRotatedFlipPaths = function(givenPathData) {
        var temp, i, newX, newY, inputPath, angle, Xoffset, Yoffset, PathArray, maxX, minX, maxY, minY, objectWidth, objectHeight,
            objectTop, objectLeft, pathString, graphicID, newPath; 
        _.each(givenPathData, function(given) {
            temp = [];
            for(i = 0; i < given.path.length; i++) {
                newX = given.path[i][0];
                newY = given.path[i][1];
                if(given.fliph){newX = given.width - given.path[i][0]; }
                if(given.flipv){newY = given.height - given.path[i][1]; }
                temp.push([newX, newY]);
            }
            given.path = temp;
            graphicID = given.forID;
            inputPath = given.path;
            angle = given.rotation;
            Xoffset = given.left - (given.width/2);
            Yoffset = given.top - (given.height/2);
            PathArray = []; 
            if(!angle) angle = 0;
            if(!Xoffset) Xoffset = 0;
            if(!Yoffset) Yoffset = 0;
            maxX = 0;
            minX = false;
            maxY = 0;
            minY = false;
            for(i = 0; i < inputPath.length; i++) {
                PathArray.push([inputPath[i][0], inputPath[i][1]]);
                PathArray[i] = pathingRotation(angle, PathArray[i],given.width,given.height);
                if(PathArray[i][0] > maxX) maxX = PathArray[i][0];
                if(minX === false || Number(PathArray[i][0]) < Number(minX)) minX = PathArray[i][0];
                if(PathArray[i][1] > maxY) maxY = PathArray[i][1];
                if(minY === false || PathArray[i][1] < minY) minY = PathArray[i][1];
            }
            objectWidth = maxX - minX;
            objectHeight = maxY - minY;
            objectTop = minY + (objectHeight/2); 
            objectLeft = minX + (objectWidth/2);
            for(i = 0; i < PathArray.length; i++) {
                PathArray[i][0] = PathArray[i][0] - minX;
                PathArray[i][1] = PathArray[i][1] - minY;
            }
            pathString = "";
            for(i = 0; i < PathArray.length; i++) {
                if(i != 0) {
                    pathString += ",[\"L\"," + PathArray[i][0] + "," + PathArray[i][1] + "]";
                } else {
                    pathString = "[\[\"M\"," + PathArray[i][0] + "," + PathArray[i][1] + "]";  
                }
            }
            pathString += "\]";
            objectTop = objectTop + Yoffset; 
            objectLeft = objectLeft + Xoffset;
            given.path = pathString;
            given.left = objectLeft;
            given.top = objectTop;
            newPath = createObj('path',{ 
                pageid: Campaign().get('playerpageid'), 
                layer: 'walls', 
                path: given.path,
                left: given.left,
                top: given.top,
                width: objectWidth, 
                height: objectHeight, 
                rotation: 0,
                fliph: false,
                flipv: false,
                stroke: given.stroke,
                stroke_width: given.strokewidth,
                controlledby: graphicID
            });
        });  
    },
    
    pathingRotation = function(angle, point,width,height) {
        var pointX = point[0], pointY = point[1], originX = (width/2), originY = (height/2);
        angle = angle * Math.PI / 180.0;
        return [
            Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
            Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
        ];
    },
    
    mainmenu = function() {
        sendChat('Dungeon Mapper Tools', ' ');
        sendChat('Main Menu', '/direct '
            +'<br><a href="!walls10x10"' + atagOneStyle + '><span ' + spanOneStyle + '>Walls 10x10</span></a>'
            +'<br><a href="!walls20x20"' + atagOneStyle + '><span ' + spanOneStyle + '>Walls 20x20</span></a>'
            +'<br><a href="!walls5x5"' + atagOneStyle + '><span ' + spanOneStyle + '>Walls 5x5</span></a>'
            +'<br><a href="!stairs10x10"' + atagOneStyle + '><span ' + spanOneStyle + '>Stairs 10x10</span></a>'
            +'<br><a href="!doors10x10"' + atagOneStyle + '><span ' + spanOneStyle + '>Doors 10x10</span></a>'
            +'<br><a href="!light5x5"' + atagOneStyle + '><span ' + spanOneStyle + '>Lights 5x5</span></a>'
            +'<br><a href="!spawnDuplicateToken"' + atagTwoStyle + '><span ' + spanTwoStyle + '>Place Duplicate Marker</span></a>'
            +'<br><a href="!packSelect"' + atagTwoStyle + '><span ' + spanTwoStyle + '>Select Pack</span></a>'
            +'<br><a href="!toggleTokenAction"' + atagTwoStyle + '><span ' + spanTwoStyle + '>Token Actions On/Off</span></a>'
            +'<br><a href="!readydoors"' + atagTwoStyle + '><span ' + spanTwoStyle + '>Ready Doors</span></a>'
            );
    },
    
    subMenu = function(menu,heading,scale) {
        var i = 0, tableText, tileData = _.where(state.currentTexture, {menu: menu});
        sendChat('Dungeon Mapper Tools', ' ');
        tableText = ''
            +'<div' + tablDivStyle + '>';
        while (i < tileData.length) {     
            tableText += '<div' + trowDivStyle + '>'
	    for(var j=0;j < columnNum && (i+j) < tileData.length;j++) {
                tableText+='<div' + cellDivStyle + '>'
                    +'<a img href="!tileNumber ' + tileData[i+j].tileNumber + '" ' + atagOneStyle + '>'
                    +'<img src="' + leadingURL
                    + tileData[i+j].urlValue
                    +' height="' + Math.floor(tileData[i+j].height/scale) + '" width="' + Math.floor(tileData[i+j].width/scale) + '" border="0"' + imagDivStyle + '">'
                    +'</a>'
                    +'</div>';
	    }
            tableText += '</div>';
	    i += columnNum;
        }
        tableText += '</div>';
        sendChat(heading, '/direct ' + tableText + '<br><a href="!mainmenu"' + atagThrStyle + '><span ' + spanOneStyle + '>Main Menu</span></a>');
    },
    
    packSelect = function() {
        var i = 0, menuText = '';
        sendChat('Dungeon Mapper Tools', ' ');
        while (i < installedTextures.length) { 
            menuText += '<br><a href="!texture ' + installedTextures[i] + '"' + atagTwoStyle + '"><span ' + spanTwoStyle + '>' + installedTextures[i] + '</span></a>'
            i++;
        }
        menuText += '<br><a href="!mainmenu"' + atagThrStyle + '><span ' + spanOneStyle + '>Main Menu</span></a>';
        sendChat('Pack Select', menuText);
    },
    
    setupDungeonMapper = function(playerid) {
        createMacros(playerid);
    },
    
    removepDungeonMapper = function(playerid) {
        removeMacros();
    },

    createMacros = function(playerid) {
        var macrosFound;
        _.each(moduleMacros, function(obj) {
            macrosFound = findObjs({ _type: 'macro', name: obj.name});
            if (macrosFound.length === 0) {    
                createObj('macro', {
                    name: obj.name,  
                    _playerid: playerid,
                    visibleto: playerid,
                    action: obj.action,
                    istokenaction: obj.istokenaction
                });
            }
        });  
    },
    
    toggleTokenAction = function() {
        var macrosFound, tokenAction;
        _.each(moduleMacros, function(obj) {
            macrosFound = findObjs({ _type: 'macro', name: obj.name});
            tokenAction = macrosFound[0].get('istokenaction');
            if('!mainmenu' !== macrosFound[0].get('action')){ 
                if(true === tokenAction){
                    tokenAction = false;
                }else{
                    tokenAction = true;
                }
                macrosFound[0].set({istokenaction: tokenAction});
            }
        });
        sendChat('Dungeon Mapper Settings', ' ');
        sendChat('Token Actions Changed', 'Be sure to deslect and select any tokens for change to take effect.<br><a href="!mainmenu"' + atagThrStyle + '><span ' + spanOneStyle + '>Main Menu</span></a>');
    },
    
    removeMacros = function() {
        var macrosFound;
        _.each(moduleMacros, function(obj) {
            macrosFound = findObjs({ _type: 'macro', name: obj.name});
            if (macrosFound.length !== 0) { 
                macrosFound[0].remove();
            }
        });
    },
    
    refreshDefaut = function() {
		state.currentTexture = DungeonMapperTextures[defaultTexture];
        state.currentTextureName = defaultTexture;
	},
    
    checkInstall = function() {
        installedTextures = new Array;
        if( ! _.has(state,'currentTexture')) {
			state.currentTexture = DungeonMapperTextures[defaultTexture];
            state.currentTextureName = defaultTexture;
		}
        Object.keys(DungeonMapperTextures).forEach(function(key) {
            installedTextures.push(key);
        });
	},
 
    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:graphic', handleGraphicChange);
        on('destroy:graphic', handleGraphicDestroy);
        checkInstall();
    };
	return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
    
}());
 
on('ready',function(){
	'use strict';
    DungeonMapper.RegisterEventHandlers();
});
