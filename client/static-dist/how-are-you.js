if (typeof HRU2 == 'undefined') { HRU2 = {}; }

HRU2.dialogWhyBad = {
  /*
    in_check_id << event.data.option
    in_state_reset << event.data.reset
    in_state_check <<  $('#why-bad-' + in_check_id).is(":checked");
    in_option_list << how_are_you.why_bad_options
  */
  selected_options: [],
  reset_option: false,
  options: {},
/***********************************************************************/
  configure: function configure(
    options,
    check_unsetter,
    button_state_updater,
    submit_event_handler
  ) {
    this.unset_checkbox_ex = check_unsetter;
    this.options = options;
    this.button_state_updater_ex = button_state_updater;
    this.submit_event_handler = submit_event_handler;
  },

  state_enter_reset: function state_reset(selected_option) {
    for (var key in this.options){
      if (key != selected_option){
        this.unset_checkbox_ex(key);
      }
    }
    this.reset_option = selected_option;
    this.selected_options = [selected_option];
  },

/***********************************************************************/
  stm_update_list: function stm_update_list(
    selected_option,
    is_checked
  ) {
    if (this.options[selected_option].reset){
      if (is_checked){
        this.state_enter_reset(selected_option);
      } else {
        this.selected_options = [];
      }
    } else {
      if (is_checked){
        if (this.reset_option){
          this.unset_checkbox_ex(this.reset_option);
          this.selected_options = [selected_option];
          this.reset_option = false;
        } else {
          this.selected_options.push(selected_option);
        }
      } else {
        this.selected_options
          .splice(this.selected_options.indexOf(selected_option), 1);
      }
    }
    this.button_state_updater_ex();
  },

/************************************************************************
  UI specific function defaults, test only via e2e
************************************************************************/
  unset_checkbox: function unset_checkbox(checkbox_id) {
    $('#why-bad-' + checkbox_id).prop('checked', false);
  },

/***********************************************************************/
  button_state_updater: function button_state_updater() {
    var submit_btn = $('a[name="submit-bads"]');
    if (this.selected_options.length>0){
      if (submit_btn.hasClass('disabled')){
        submit_btn.removeClass('disabled');
        submit_btn.on('click', this.submit_event_handler);
      }
    } else {
      submit_btn.addClass('disabled');
      submit_btn.off('click');
    }
  }

};

/* how_r_you kind of a front-end =) */
/*jslint browser: true*/
/*jslint indent: 2*/
/*global $, jQuery, alert, console*/
/* IE is scary: ActiveXObject('WScript.Network').computerName;
Thats why we go through all this trouble with cookies here. */


var HowAreYou = (function () {
  "use strict";
  var how_are_you = {},
      why_bad_stm = HRU2.dialogWhyBad,
      widget_root = '#deploy-how-are-you-widget';

  how_are_you.cookies = {
    team: "how-are-you-team-code",
    vote: "how-are-you-vote"
  };
  how_are_you.config = {
    team_expire: 90*24*60*60*1000,
    vote_expire: 24*60*60*1000,
    can_vote_check_interval: 60*1000,
    xwin_check_interval: 1000,
    thanks_fadeout_delay: 2000
  };
  how_are_you.results = {};
  how_are_you.anonymity_text = '';
  how_are_you.url_widget_stats = '';
  how_are_you.opts = {};
  how_are_you.bad_options = [];
  how_are_you.set_anonymity_url = function () {
    how_are_you.anonymity_text = 'This is anonymous and <a target="blank" href="'+how_are_you.base_url+'">no personal data is used</a>';
  };

  function load_app_stylesheet(a) {
    $(widget_root).hide();
    if (!document.getElementById(a)) {
      var head  = document.getElementsByTagName('head')[0],
        link  = document.createElement('link');
      link.id   = a;
      link.rel  = 'stylesheet';
      link.type = 'text/css';
      link.href = a;
      link.media = 'all';
      head.appendChild(link);
    }
  }

  how_are_you.init = function (baseurl) {
    load_app_stylesheet(baseurl+"/static/how-are-you.min.css");
    how_are_you.base_url = baseurl;
    how_are_you.url_widget_stats = baseurl;
    how_are_you.set_anonymity_url();
  };

  function handle_end_of_session() {
    how_are_you.results.team = how_are_you.team_id;
    // if (how_are_you.results.wv == null){
    //   how_are_you.results.wv = [how_are_you.opts.wv[0]];
    // }
    console.log(how_are_you.results);

    var vote_a_day = getCookie(how_are_you.cookies.vote);
    if (vote_a_day === undefined){
      setCookie(how_are_you.cookies.vote, "done", how_are_you.config.vote_expire);
      $.ajax({
        type: "POST",
        url: how_are_you.base_url + "/api/vote",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(how_are_you.results),
        success: function(data){
          //TODO: handle lottery reply here;
          //TODO: handle custom thanks here;
          console.log("data sent: " + how_are_you.results);
        },
        failure: function() { console.log("Data transfer failed.."); }
      });
      }
  }

  how_are_you.handle_vote_option_click = function (e) {
    how_are_you.results.mv = e.data.option;
  };

  how_are_you.handle_bad_list_submit = function () {
    how_are_you.results.wv = why_bad_stm.selected_options;
    handle_end_of_session();
  };

  function handle_checkbox_state_change(e) {
    var is_checked = $('#why-bad-' + e.data.option).is(":checked");
    why_bad_stm.stm_update_list(e.data.option, is_checked);
  }

  function setCookie(name, value, ms_to_expire) {
    var exp_date = new Date();
    exp_date.setMilliseconds(exp_date.getMilliseconds() + ms_to_expire);
    var expires = "; expires="+exp_date.toUTCString();
    document.cookie = name+"="+value+expires+"; path=/";
  }

  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  function Arr2object(keys, vals) {
    return keys.reduce(
      function(prev, val, i) {
        prev[val] = vals[i];
        return prev;
      }, {}
    );
  }

  /*****************************************************************************
  TEAM CONFIG MANAGER
  *****************************************************************************/
  how_are_you.session_watchdog = function() {
    var hru_conf = getCookie(how_are_you.cookies.team);
    if (hru_conf === undefined){
      //if (how_are_you.state != "config"){
        // load the options and show the dialog
        $.ajax({
          url: how_are_you.base_url + "/api/set-team",
          type: "GET",
          cache: false,
          success: function(data){
            widget_show_config(data, how_are_you.vote_a_day_watchdog);
          },
          error: function(data){
            console.error("Failed to load resource - CORS not configured");
          }
        });
      //}
    } else {
      if (hru_conf != "ignore"){
        how_are_you.team_id = hru_conf;
        how_are_you.vote_a_day_watchdog();
      }
    }
  };

  how_are_you.xwin_watchdog = function() {
    // yet another watchdog to close dialogs in other windows if one voted
    // this one should run only while a widget is deployed()
    var vote_a_day = getCookie(how_are_you.cookies.vote);
    if (vote_a_day === undefined){
      setTimeout(how_are_you.xwin_watchdog, how_are_you.config.xwin_check_interval);
    } else {
      $(widget_root).fadeOut('fast', function() {
        $(widget_root).html("");
        how_are_you.results = {};
        how_are_you.session_watchdog();
      });
     }
  };

  /****************************************************************************
  VOTE-A-DAY COOKIE MANAGER
  ****************************************************************************/
  how_are_you.vote_a_day_watchdog = function () {
    var vote_a_day = getCookie(how_are_you.cookies.vote);
    if (vote_a_day === undefined){
      how_are_you.xwin_watchdog();
      show_moods_dialog();
    } else {
      setTimeout(how_are_you.vote_a_day_watchdog, how_are_you.config.can_vote_check_interval);
    }
  };

  /****************************************************************************
  Deploy Votes Dialog
  ****************************************************************************/
  function show_moods_dialog() {
    $.ajax({
      url: how_are_you.base_url + "/api/vote",
      cache: false,
      success: function(data){
        how_are_you.results.wk = data.wk;
        how_are_you.results.mk = data.mk;
        how_are_you.opts.wv = data.wv;
        how_are_you.opts.wo = data.wo;
        how_are_you.widget_show_moods(data.mv);

        // bind additional option click handlers
        $('#moods-opt-1').on('click', how_are_you.widget_show_thanks); //how_are_you.dialog_give_awa
        $('#moods-opt-2').on('click', how_are_you.widget_show_thanks);
        $('#moods-opt-3').on('click', how_are_you.widget_show_thanks);
        $('#moods-opt-4').on('click', how_are_you.widget_why_bad);
      },
      error: function(data){
        console.error("Failed to load vote options");
      }
    });


    // TODO: get vote codes for why-bad


  }
  /***************************************************************************/


  /*************************************************************************
    VIEW BUILDERS
  **************************************************************************
  thanks dialog constructor */
  how_are_you.widget_show_thanks = function () {
    $(widget_root).html("");
    $('<div/>', { id: 'vote-thanks', 'class': 'caption', style: 'width:220px;',
      html: "Thank you!<br> Have a good day!"}).appendTo(widget_root);
    $(widget_root).append('if curious, you may<br/><a target="blank" href="' + how_are_you.url_widget_stats + '">check out statistics here</a>');
    $(widget_root).delay(how_are_you.config.thanks_fadeout_delay).fadeOut('slow', function() {
      handle_end_of_session();
    });
  };

  /*************************************************************************
  voucher give-away dialog */
  how_are_you.dialog_give_away = function () {
    $(widget_root).html("");
    $(widget_root).append('<div class="give-away-message-row"><div class="prize-icon svg-prize"></div><div class="message-container"><div class="caption" style="">Congratulations,<br>you\'ve been chosen!</div>Your feedback contributes to a better<br>place to work journey!<br><br>To thank all of you we\'d like to give a<br>bonus voucher to a random participant<br>on a random day every week</div></div><div class="code-row"><input value="a_demo_token" style="" type="text"><a class="btn" id="go-away" href="#">claim it now</a></div><div id="disclaimer">please take a screenshot of this dialog or copy the code, just in case</div>');
    $('#go-away').on('click', handle_end_of_session);
  };

  /*************************************************************************
  why-bad dialog constructor */
  how_are_you.widget_why_bad = function () {
    $(widget_root).html("");
    $(widget_root).append('<div><div class="caption">We\'re sorry that you feel bad,</br>would you share why?</div><div class="why-bad-list"><ul id="opt-list-ul"></ul></div><div id="why-bad-btns"><a class="btn" id="go-away" href="#">not this time</a>&nbsp;<a name="submit-bads" class="btn disabled" href="#">submit</a></div></div><div id="disclaimer">' +  how_are_you.anonymity_text + '</div>');
    how_are_you.opts.wo.forEach(function(opt, i) {
      var key = how_are_you.opts.wv[i];
      $('#opt-list-ul').append('<li><input type="checkbox" id="why-bad-'+key+'"/> '+opt.name+'</li>');
      $('#why-bad-'+key).on('change', { option: key, reset: (opt.reset) },
        handle_checkbox_state_change);
    });

    $('#go-away').on('click', handle_end_of_session);
    why_bad_stm.configure(
      Arr2object(how_are_you.opts.wv, how_are_you.opts.wo),
      why_bad_stm.unset_checkbox,
      why_bad_stm.button_state_updater,
      how_are_you.handle_bad_list_submit);
  };

  /**********************************************************************
  moods dialog constructor */
  how_are_you.widget_show_moods = function(opts){
    $(widget_root).html("");
    $(widget_root).append('<div class="caption">How are you today?</div><div id="options-row"><a id="moods-opt-1" class="vote-option svg-opt_1"></a><a id="moods-opt-2" class="vote-option svg-opt_2" ></a><a id="moods-opt-3" class="vote-option svg-opt_3" ></a><a id="moods-opt-4" class="vote-option svg-opt_4" ></a></div><div id="option-go-away"><a id="go-away">or make this dialog disappear for today</a></div><div id="disclaimer">'+ how_are_you.anonymity_text + '</div><div></div>');

      // attach event handlers
      $('#moods-opt-1').on('click', { option: opts[0]}, how_are_you.handle_vote_option_click);
      $('#moods-opt-2').on('click', { option: opts[1]}, how_are_you.handle_vote_option_click);
      $('#moods-opt-3').on('click', { option: opts[2]}, how_are_you.handle_vote_option_click);
      $('#moods-opt-4').on('click', { option: opts[3]}, how_are_you.handle_vote_option_click);
      $('#go-away').on('click', handle_end_of_session);

      // reveal the widget
      $(widget_root).fadeIn('slow');
  };

  /**********************************************************************
  config dialog constructor */
  function widget_show_config (a, call_on_success){
    $(widget_root).html("");
    $(widget_root).append('<div class="caption">Set-up "how-are-you" tool</div><div>Please confirm your team:<br/><select id="hru-team-config"><option disabled selected value="">Please select one</option></select></div><div id="option-go-away"><a class="btn" id="hru-save-conf">Save</a></div><div id="disclaimer">'+ how_are_you.anonymity_text + '</div><div></div>');
      $.each(a['team-options'], function(option){
        var opt = (a['team-options'][option]);
        var opt_enabled = "";
        if (opt.spacer === true) opt_enabled = " disabled";
        $('#hru-team-config').append('<option' + opt_enabled + ' value=' + opt.key + '>' + opt.name + '</option>');
      });
      $('#hru-save-conf').on('click', function(){
        var team_id = $('#hru-team-config').find(":selected").val();
        if (team_id.length > 0){
          // console.log("team key is " + team_id);
          setCookie(how_are_you.cookies.team, team_id, how_are_you.config.team_expire);
          $(widget_root).fadeOut('fast', function() {
            how_are_you.team_id = team_id;
            call_on_success();
          });
        } else {
          console.log("Need a proper selection, please select something...");
        }
      });

      // reveal the widget
      $(widget_root).fadeIn('slow');
    how_are_you.state = "config";
  }

  return how_are_you;
})();

function wait_for_jquery(callback) {
  var interval = 100; // ms
  window.setTimeout(function () {
    if (window.jQuery) { callback(); } else {
      window.setTimeout(wait_for_jquery, interval);
    }}, interval);
}

function votes_run(a, b){
  wait_for_jquery(function() {
    $(document).ready(function() {
      var how_r_you = HowAreYou;
      how_r_you.init(a);
      how_r_you.session_watchdog();
    });
  });
}
