const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Lang = imports.lang;
const Tweener = imports.ui.tweener;
const ExtensionSystem = imports.ui.extensionSystem;
const ExtensionUtils = imports.misc.extensionUtils;


const CONLICT_UUID = ["window-open-animation-scale-in@mengzhuo.org"];
const WINDOW_ANIMATION_TIME = 0.3;

const SlideInForWindow = new Lang.Class({
    
    Name: "SlideInForWindow",
    
    _init: function (){
        
        this._display =  global.screen.get_display();
        
        this.signalConnectID = this._display.connect('window-created', Lang.bind(this, this._slideIn));
        this.afterSignalConnectID = this.display.connect_after('window-created', Lang.bind(this, this._animationDone));
        global._slide_in_aminator = this;
        
        this._half = global.screen_width/2;
        
    },
    _slideIn : function (display,window){
        
        if (window.maximized_horizontally == false && window.get_window_type() == Meta.WindowType.NORMAL){
            let actor = window.get_compositor_private();
            log("SAW:title %s".format(window.get_title()) )
            log("SAW:max %s".format(window.maximized_horizontally) )
            log("SAW:type %s".format(window.get_window_type() ))
            window._slideAnimation = true;
            
            [prevX,prevY] = actor.get_position();
            
            actor.prevX = prevX
            
            [width,height] = actor.get_size();
            
            let centerX = (prevX+Math.round(width/2));
            
            let startX = (centerX-this._half < 0 )?prevX-Math.round(width/2):prevX+Math.round(width/2); // default in the left part
            
            actor.set_position(startX,prevY);
            actor.set_opacity(200);
            
            Tweener.addTween(actor,{
                             x:prevX,
                             opacity:255,
                             time: WINDOW_ANIMATION_TIME,
                             transition: 'easeOutQuad',
                             onComplete: this._animationDone,
                             onCompleteParams:[actor,prevX],
                             onCompleteScope : this,
                             onOverwrite : this._animationDone,
                             onOverwriteScope : this,
                             onOverwriteParams: [actor,prevX]
                            });
        };
    },
    _animationDone : function(actor){
        actor.x = actor.prevX;
    },
    destroy : function (){
        delete global._slide_in_aminator;
        this._display.disconnect(this.signalConnectID);
        this._display.disconnect(this.afterSignalConnectID);
    },
    _onDestroy : function (){
        this.destroy();
    }
});

let slidemaker = null;
let metadata = null;

function enable() {
    // check conflict extension
    for (var item in ExtensionUtils.extensions){
        
        if (CONLICT_UUID.indexOf(item.uuid) >= 0 && item.state == ExtensionSystem.ExtensionState.ENABLED){
            throw new Error('%s conflict with %s'.format(item,metadata.uuid));
            scalemaker = 'CONFLICTED';
        }
        
    }
    
    if (slidemaker == null){
        slidemaker = new SlideInForWindow();
    }
}
function disable() {
    if (slidemaker != null){
        slidemaker.destroy();
        slidemaker = null;
    }
}
function init(metadataSource) {
    metadata = metadataSource;
}
