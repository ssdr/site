var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

(function($) {

  var Placeholder = {

     _PLACEHOLDERS : [],

    _p : function( $field ) {

       this.fieldObject = $field;
       this.placeholderText = $field.val();
       var placeholderText = $field.val();

       $field.addClass('ph');

       $field.blur(function() {
         if ( $(this).val() == '' ) {
           $(this).val( placeholderText );
           $(this).addClass('ph');
         }
       });

       $field.focus(function() {
         $(this).removeClass('ph');
         if ( $(this).val() == placeholderText ) {
           $(this).val('');
         } else {
           $(this)[0].select();
         }
       });

     },

     add : function( $field ) {
       Placeholder._PLACEHOLDERS.push( new Placeholder._p( $field ) );
     },

     clearAll: function() {
       for ( var i=0; i < Placeholder._PLACEHOLDERS.length; i++ ) {
         if ( Placeholder._PLACEHOLDERS[i].fieldObject.val() ==
              Placeholder._PLACEHOLDERS[i].placeholderText ) {
           Placeholder._PLACEHOLDERS[i].fieldObject.val('');
         }
       }
     },

     exists : function() {
       return ( _PLACEHOLDERS.length );
     }

 };

 $.GollumPlaceholder = Placeholder;

})(jQuery);

}
/*
     FILE ARCHIVED ON 04:12:35 Jun 07, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 12:43:48 Apr 02, 2023.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 110.05
  exclusion.robots: 0.097
  exclusion.robots.policy: 0.087
  cdx.remote: 0.065
  esindex: 0.01
  LoadShardBlock: 84.734 (3)
  PetaboxLoader3.datanode: 109.97 (5)
  load_resource: 333.516 (2)
  PetaboxLoader3.resolve: 224.035 (2)
*/