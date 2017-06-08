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
