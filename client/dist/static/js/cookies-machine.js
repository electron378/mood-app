/*
  A Machine for handling Cookies,
  a component of the Mood App

  Copyright 2017 Viktor Kravchenko <electron378@gmail.com>
  Released under the MIT license:

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
  Made to handle events:
  - config unset
  - vote unset
*/

var MoodApp_stm_Cookies = (function () {
  var out = {},
      scanInterval = 500,
      cookieVotesDone = "how-are-you-vote",
      cookieTeamCode =  "how-are-you-team-code";

  out.votes_done = false;
  out.votes_done_prev_state = false;
  out.team_code = Cookies.get(cookieTeamCode);

  out.watch = function (on_state_change_callback) {
    out.watch_interval = setInterval(function () {
      if (Cookies.get(cookieVotesDone) === undefined) {
        out.votes_done = false;
      } else {
        out.votes_done = true;
        // now we can stop the interval watch for state update functionality
        // or not, we'll see how it affects performance first
        //clearInterval(out.watch_interval);
      }
      if (out.votes_done != out.votes_done_prev_state){
        out.team_code = Cookies.get(cookieTeamCode);
        on_state_change_callback(out.votes_done);
      }
      out.votes_done_prev_state = out.votes_done;
    }, scanInterval);
  };

  return out;
})();
