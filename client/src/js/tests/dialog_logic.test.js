describe("dialog state machine", function() {
  var dialog = HRU2.dialogWhyBad;

  /* Fixture set-up */
  var fixture = {};
  fixture.options = {
    opt1: {text: "opt 1"},
    opt2: {text: "opt 2", reset: true},
    opt3: {text: "opt 3"}
  };
  fixture.check_states = [];
  fixture.check_unsetter = function (check_id) {
    fixture.check_states.push(check_id);
  };
  fixture.button_setter = function () {};

  /* Test cases */
  it("should be able to initialze", function() {
    dialog.configure(
      fixture.options,
      fixture.check_unsetter,
      fixture.button_setter,
      function(){});
    expect(dialog.options).toEqual(fixture.options);
  });

  it("should set selected_options list to [opt1] given selected_option is opt1 and is_checked set.", function() {
    dialog.stm_update_list("opt1", true);
    expect(dialog.selected_options).toEqual(["opt1"]);
  });

  it("should set selected_options list to [opt1, opt3] given selected_option is opt3 and is_checked set.", function() {
    dialog.stm_update_list("opt3", true);
    expect(dialog.selected_options).toEqual(['opt1', 'opt3']);
  });

  it("should set selected_options list to [opt3] given selected_option is opt1 and is_checked unset.", function() {
    dialog.stm_update_list("opt1", false);
    expect(dialog.selected_options).toEqual(['opt3']);
  });

  it("should set selected_options list to [opt2] given selected_option is opt2 and is_checked set.", function() {
    dialog.stm_update_list("opt2", true);
    expect(dialog.selected_options).toEqual(['opt2']);
  });
});
