const Meta = imports.gi.Meta;
const Lang = imports.lang;
const Tweener = imports.ui.tweener;
const Extension = imports.misc.extensionUtils;
const ExtensionLists = Extension.extensions;

const WINDOW_ANIMATION_TIME = 0.20;

const SlideInForWindow = new Lang.Class({
    Name: "SlideInForWindow",
    
    _init: function (){
        
        let display = global.screen.get_display();
        
        display.connect('window-created', Lang.bind(this, this._slideIn));

        global._slide_in_aminator = this;
        
        this._half = global.screen_width/2;
        
    },
    _slideIn : function (display,window){
        
        if (!window.maximized_horizontally && window.get_window_type() == Meta.WindowType.NORMAL){
            let actor = window.get_compositor_private();
            
            let [prevX,prevY] = actor.get_position();
            
            let [width,height] = actor.get_size();
            
            let centerX = (prevX+Math.round(width/2));
            
            let startX = (centerX-this._half < 0 )?prevX-Math.round(width/2):prevX+Math.round(width/2); // default in the left part
            
            actor.set_position(startX,prevY);
            actor.set_opacity(200);
            
            Tweener.addTween(actor,{
                             x:prevX,
                             opacity:255,
                             time: WINDOW_ANIMATION_TIME,
                             transition: 'easeOutQuad'
                            });
        };
    }
});

let slidemaker = null;
let metadata = null;

function enable() {
    // check conflict extension
    for  (var extension in ExtensionLists){
        if (extension.state == 1){ // WORKAROUND:I can't found enum of extension state
            for (var conflict in metadata.conflict-uuid){
                if (extension.uuid == conflict){
                    throw new Error('%s conflict with %s'.format(metadata.uuid,conflict));
                    return false;
                }
            }
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
