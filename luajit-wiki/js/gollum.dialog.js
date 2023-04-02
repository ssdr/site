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

/**
  *  gollum.dialog.js
  *
  *  Used for dialogs. Duh.
  *
  */

(function($) {

  var Dialog = {

    debugOn: false,
    markupCreated: false,
    markup: '',

    currentAspect: function(){
      if (window.innerWidth < 480) return "small-mobile";
      if ($('#gollum-dialog-dialog').css('position') == 'fixed') return "large-mobile";
      return "desktop";
    },

    attachEvents: function( evtOK ) {
      $('#gollum-dialog-action-ok').click(function( e ) {
        Dialog.eventOK( e, evtOK );
      });
      $('#gollum-dialog-action-cancel').click( Dialog.eventCancel );
      $('#gollum-dialog-dialog input[type="text"]').keydown(function( e ) {
        if ( e.keyCode == 13 ) {
          Dialog.eventOK( e, evtOK );
        }
      });
    },

    detachEvents: function() {
      $('#gollum-dialog-action-ok').unbind('click');
      $('#gollum-dialog-action-cancel').unbind('click');
    },

    createFieldMarkup: function( fieldArray ) {
      var fieldMarkup = '<fieldset>';
      for ( var i=0; i < fieldArray.length; i++ ) {
        if ( typeof fieldArray[i] == 'object' ) {
          fieldMarkup += '<div class="field">';
          switch ( fieldArray[i].type ) {

          case 'text':
            fieldMarkup += Dialog.createFieldText( fieldArray[i] );
            break;

          case 'file':
            fieldMarkup += Dialog.createFieldFile( fieldArray[i] );
            break;

          default:
            break;

          }
          fieldMarkup += '</div>';
        }

      }
      fieldMarkup += '</fieldset>';
      return fieldMarkup;
    },

    createFieldText: function( fieldAttributes ) {
      var html = '';

      if ( fieldAttributes.name ) {
        html += '<label';
        if ( fieldAttributes.id ) {
          html += ' for="gollum-dialog-dialog-generated-field-' + fieldAttributes.id + '"';
        }
        html += '>' + fieldAttributes.name + '</label>';
      }

      html += '<input type="text"';

      if ( fieldAttributes.id ) {
        html += ' name="' + fieldAttributes.id + '"'
        if ( fieldAttributes.type == 'code' ) {
          html+= ' class="code"';
        }
        if ( fieldAttributes.defaultValue ) {
          html+= ' value="' + fieldAttributes.defaultValue.split('"').join('&quot;') + '"';
        }
        html += ' id="gollum-dialog-dialog-generated-field-' +
          fieldAttributes.id + '">';
      }

      if( fieldAttributes.context ){
        html += '<span class="context">' + fieldAttributes.context + '</span>';
      }

      return html;
    },

    createFieldFile: function( fieldAttributes ) {
      // Not actually a field, but an embedded form.
      var html = '';

      var id = fieldAttributes.id || 'upload';
      var name = fieldAttributes.name || 'file';
      var action = fieldAttributes.action || '/uploadFile';

      html += '<form method=post enctype="multipart/form-data" ' +
        'action="' + action + '" ' + 'id="' + id + '">';
      html += '<input type="hidden" name="upload_dest" value="' +
        uploadDest + '">';
      html += '<input type=file name="' + name + '">';
      html += '</form>';

      if( fieldAttributes.context ){
        html += '<span class="context">' + fieldAttributes.context + '</span>';
      }

      return html;
    },

    createMarkup: function( title, body ) {
      Dialog.markupCreated = true;
      if ($.facebox) {
        return '<div id="gollum-dialog-dialog">' +
               '<div id="gollum-dialog-dialog-title"><h4>' +
               title +'</h4></div>' +
               '<div id="gollum-dialog-dialog-body">' + body + '</div>' +
               '<div id="gollum-dialog-dialog-buttons">' +
               '<a href="#" title="Cancel" id="gollum-dialog-action-cancel" ' +
               'class="gollum-minibutton">Cancel</a>' +
               '<a href="#" title="OK" id="gollum-dialog-action-ok" '+
               'class="gollum-minibutton">OK</a>' +
               '</div>' +
               '</div>';
      } else {
        return '<div id="gollum-dialog-dialog">' +
               '<div id="gollum-dialog-dialog-inner">' +
               '<div id="gollum-dialog-dialog-bg">' +
               '<div id="gollum-dialog-dialog-title"><h4>' +
               title +'</h4></div>' +
               '<div id="gollum-dialog-dialog-body">' + body + '</div>' +
               '<div id="gollum-dialog-dialog-buttons">' +
               '<a href="#" title="Cancel" id="gollum-dialog-action-cancel" ' +
               'class="minibutton">Cancel</a>' +
               '<a href="#" title="OK" id="gollum-dialog-action-ok" '+
               'class="minibutton">OK</a>' +
               '</div>' +
               '</div>' +
               '</div>' +
               '</div>';
      }
    },

    eventCancel: function( e ) {
      e.preventDefault();
      debug('Cancelled dialog.');
      Dialog.hide();
    },

    eventOK: function( e, evtOK ) {
      e.preventDefault();

      var results = [];
      // get the results from each field and build them into the object
      $('#gollum-dialog-dialog-body input').each(function() {
        results[$(this).attr('name')] = $(this).val();
      });

      // pass them to evtOK if it exists (which it should)
      if ( evtOK &&
           typeof evtOK == 'function' ) {
        evtOK( results );
      }
      Dialog.hide();
    },

    hide: function() {
      if ( $.facebox ) {
        Dialog.markupCreated = false;
        $(document).trigger('close.facebox');
        Dialog.detachEvents();
      } else {
        if ( $.browser.msie ) {
          $('#gollum-dialog-dialog').hide().removeClass('active');
          $('select').css('visibility', 'visible');
        } else {
          $('#gollum-dialog-dialog').animate({ opacity: 0 }, {
            duration: 200,
            complete: function() {
              $('#gollum-dialog-dialog').removeClass('active');
              $('#gollum-dialog-dialog').css('display', 'none');
            }
          });
        }

        $(window).unbind('resize', Dialog.resize);
      }
    },

    init: function( argObject ) {
      var title = '';
      var body = '';

      // bail out if necessary
      if ( !argObject ||
           typeof argObject != 'object' ) {
        debug('Editor Dialog: Cannot init; invalid init object');
        return;
      }

      if ( argObject.body && typeof argObject.body == 'string' ) {
        body = '<p>' + argObject.body + '</p>';
      }

      // alright, build out fields
      if ( argObject.fields && typeof argObject.fields == 'object' ) {
        body += Dialog.createFieldMarkup( argObject.fields );
      }

      if ( argObject.title && typeof argObject.title == 'string' ) {
        title = argObject.title;
      }

      if ( Dialog.markupCreated ) {
        if ($.facebox) {
          $(document).trigger('close.facebox');
        } else {
          $('#gollum-dialog-dialog').remove();
        }
      }

      Dialog.markup = Dialog.createMarkup( title, body );

      if ($.facebox) {
        $(document).bind('reveal.facebox', function() {
          if ( argObject.OK &&
               typeof argObject.OK == 'function' ) {
            Dialog.attachEvents( argObject.OK );
            $($('#facebox input[type="text"]').get(0)).focus();
          }
        });
      } else {
        $('body').append( Dialog.markup );
        if ( argObject.OK &&
             typeof argObject.OK == 'function' ) {
          Dialog.attachEvents( argObject.OK );
        }
      }

      Dialog.show();
    },

    show: function() {
      if ( !Dialog.markupCreated ) {
        debug('Dialog: No markup to show. Please use init first.');
      } else {
        debug('Showing dialog');
        if ($.facebox) {
          $.facebox( Dialog.markup );
        } else {
          if ( $.browser.msie ) {
            $('#gollum-dialog.dialog').addClass('active');
            Dialog.position();
            $('select').css('visibility', 'hidden');
          } else {
            $('#gollum-dialog.dialog').css('display', 'none');
            $('#gollum-dialog-dialog').animate({ opacity: 0 }, {
              duration: 0,
              complete: function() {
                $('#gollum-dialog-dialog').css('display', 'block');
                Dialog.position(); // position this thing
                $('#gollum-dialog-dialog').animate({ opacity: 1 }, {
                duration: 500
                });
                $($('#gollum-dialog-dialog input[type="text"]').get(0)).focus();
              }
            });
          }
        }

        $(window).bind('resize', Dialog.resize);
      }
    },

    resize: function(){
      Dialog.position();
    },

    position: function() {
      if (Dialog.currentAspect() == "small-mobile") {
        $('#gollum-dialog-dialog-inner').css('height', '100%').css('margin-top', 'auto');
      }
      else if (Dialog.currentAspect() == "large-mobile") {
        $('#gollum-dialog-dialog-inner').css('height', 'auto').css('margin-top', 'auto');
      }
      else if (Dialog.currentAspect() == "desktop") {
        var dialogHeight = $('#gollum-dialog-dialog-inner').height();
        $('#gollum-dialog-dialog-inner')
          .css('height', dialogHeight + 'px')
          .css('margin-top', -1 * parseInt( dialogHeight / 2 ));
      }
    }
  };

  if ($.facebox) {
    $(document).bind('reveal.facebox', function() {
      $('#facebox img.close_image').remove();
    });
  }

  var debug = function(m) {
    if ( Dialog.debugOn
         && typeof console != 'undefined' ) {
      console.log( m );
    }
  };

  $.GollumDialog = Dialog;

})(jQuery);


}
/*
     FILE ARCHIVED ON 04:12:36 Jun 07, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 12:43:48 Apr 02, 2023.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 571.729
  exclusion.robots: 0.067
  exclusion.robots.policy: 0.058
  cdx.remote: 0.055
  esindex: 0.02
  LoadShardBlock: 545.019 (3)
  PetaboxLoader3.datanode: 339.913 (5)
  PetaboxLoader3.resolve: 521.753 (4)
  load_resource: 344.129 (2)
*/