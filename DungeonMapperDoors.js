var DungeonMapperDoors = DungeonMapperDoors  || (function(){
    'use strict';
 
    var version = 0.1,
    
    toggleIcon = 'https://s3.amazonaws.com/files.d20.io/images/8421090/L7gDUkwOw9H73WPAVgFBXg/thumb.png?1427144724',
    leadingURL = 'https://s3.amazonaws.com/files.d20.io/images/',
    
    handleInput = function(msg) {
        var args, obj, playerid;
        
        msg = _.clone(msg);
        if ( 'api' !== msg.type ) {return; }
        
        args = msg.content.split(/\s+/);
        obj =  _.first(msg.selected);
        playerid = msg.playerid
        switch(args[0]) {
            case '!readydoors': 
                readyDoors(); 
            return;
            case '!DungeonMapperDoorsToggle': 
                toggle(msg);
            break;
        }
    },
    
    toggle = function(msg) {
        var obj, objCheck, featureId, token, args, createdId, packName, packKey, 
            swapURL, pathColor, findPaths, pathId, newName;
            
        obj =  _.first(msg.selected);
        objCheck = checkSelect(obj);
        if ( objCheck == false) {return; }
        featureId = obj._id;
        token = getObj('graphic', featureId);
        args = token.get('name').split('|');
        createdId = token.get('gmnotes');
        packName = args[0].replace('_',' ');
        packKey = args[1];
        pathColor = 'NA';
        switch(packKey) {
            case '900': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '901'})[0].urlValue;
                newName = packName.replace(' ','_') + '|901';
            break;
            case '901': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '900'})[0].urlValue;
                newName = packName.replace(' ','_') + '|900';
            break;
            case '902': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '903'})[0].urlValue;
                newName = packName.replace(' ','_') + '|903';
            break;
            case '903': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '902'})[0].urlValue;
                newName = packName.replace(' ','_') + '|902';
            break;
            case '904': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '905'})[0].urlValue;
                newName = packName.replace(' ','_') + '|905';
            break;
            case '905': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '904'})[0].urlValue;
                newName = packName.replace(' ','_') + '|904';
            break;
            case '800': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '801'})[0].urlValue;
                newName = packName.replace(' ','_') + '|801';
                token.set({
                    name: newName,
                    imgsrc: swapURL,
                    light_radius: 60,
                    light_dimradius: 40,
                    light_otherplayers: true
                }); 
                return;
            break;
            case '801': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '800'})[0].urlValue;
                newName = packName.replace(' ','_') + '|800';
                token.set({
                    name: newName,
                    imgsrc: swapURL,
                    light_radius: '',
                    light_dimradius: '',
                    light_otherplayers: ''
                }); 
                return;
            break;
            case '802': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '803'})[0].urlValue;
                newName = packName.replace(' ','_') + '|803';
                token.set({
                    name: newName,
                    imgsrc: swapURL,
                    light_radius: 60,
                    light_dimradius: 40,
                    light_otherplayers: true
                }); 
                return;
            break;
            case '803': 
                swapURL = leadingURL + _.where(DungeonMapperTextures[packName], {pathKey: '802'})[0].urlValue;
                newName = packName.replace(' ','_') + '|802';
                token.set({
                    name: newName,
                    imgsrc: swapURL,
                    light_radius: '',
                    light_dimradius: '',
                    light_otherplayers: ''
                }); 
                return;
            break;
        }
        findPaths = findObjs({ 
            _type: 'path', 
            pageid: Campaign().get('playerpageid'), 
            controlledby: createdId
        });
        if(findPaths.length > 0){
            _.each(findPaths, function(eachPath) {
                if('transparent' === eachPath.get('stroke')){
                    eachPath.set({
                        stroke: '#FFFF00',
                        layer: 'walls'
                    })
                }else{
                    if('#FF0000' !== eachPath.get('stroke')){
                        eachPath.set({
                            stroke: 'transparent',
                            layer: 'gmlayer'
                        }) 
                    }
                }
            });
        }
        token.set({
            name: newName,
            imgsrc: swapURL
        })
    },
    
    checkSelect = function(obj) {
        var token;
        if (obj == undefined || obj.length < 1) {
            return false;
        }
        if (obj._type != 'graphic') {
            return false;
        }
        token = getObj('graphic', obj._id);
        if (token.get('layer') != 'objects') {
            return false;
        }
        return true;
    },
    
    
    readyDoors = function() {
        var obj, args, createdId, packName, packKey, locatedFeaeture, pathColor, findPaths, pathId, 
        controllerName = 'DoorTorchControl',  featureKeys = '800,801,802,803,900,901,902,903,904,905',
            allObjectImages = findObjs({ _type: 'graphic', layer: 'objects', pageid: Campaign().get('playerpageid')});
        _.each(allObjectImages, function(obj) { 
            args = obj.get('name').split('|');
            createdId = obj.get('gmnotes');
            packName = args[0].replace("_"," ");
            packKey = args[1];
            pathColor = 'NA';
            if(packKey === '900' || packKey === '902'){
                pathColor = '#00FF00';
            }
            if(packKey === '901' || packKey === '903'){
                pathColor = '#FFFF00';
            }
            findPaths = findObjs({ 
                _type: 'path', 
                pageid: Campaign().get('playerpageid'), 
                controlledby: createdId,
                stroke: pathColor
            });
            if(findPaths.length > 0){
                findPaths[0].set({
                    layer: 'gmlayer',
                    stroke: 'transparent'
                });
            }
            if(findPaths.length > 1){
                findPaths[1].set({
                    layer: 'gmlayer',
                    stroke: 'transparent'
                });
            }
            if(-1 !==  featureKeys.indexOf(packKey)){
               obj.set('represents', findObjs({ _type: 'character', name: controllerName})[0].get('_id'));
            }
        });
        sendChat('Dungeon Mapper', ' ');
        sendChat('Doors Ready!', 'Doors are ready for combat!');
    },
    
    checkInstall = function() {
        var controllerName = 'DoorTorchControl',
            controllerSheet = findObjs({ _type: 'character', name: controllerName}), 
            controllerAbility;
        if (controllerSheet.length === 0) { 
            createObj('character', {name: controllerName, avatar: toggleIcon}); 
        }
        controllerAbility = findObjs({ 
            _type: 'ability', 
            name: 'Toggle-Feature', 
            characterid: findObjs({ _type: 'character', name: controllerName})[0].get('_id'),
        });
        if (controllerAbility.length === 0) { 
            createObj('ability', {
                name: 'Toggle-Feature', 
                characterid: findObjs({ _type: 'character', name: controllerName})[0].get('_id'),
                action: '!DungeonMapperDoorsToggle',
                istokenaction: true
            }); 
        }
	},
    
    registerEventHandlers = function() {
        on('chat:message', handleInput);
	};
    
	return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
    
}());
 
on('ready',function(){
	'use strict';
    
    DungeonMapperDoors.RegisterEventHandlers();
    DungeonMapperDoors.CheckInstall();
 
});
