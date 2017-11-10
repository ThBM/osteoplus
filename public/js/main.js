$(function() {
  /*
  $(".delete-article").click( (e) => {
    $target = $(e.target)
    const id = $target.attr("data-id");
    $.ajax({
      type: "DELETE",
      url: "/article/" + id,
      success: (res) => {
        alert("Deleting article")
        window.location.href = "/"
      },
      error: (err) => {
        console.log(err.responseText)
      }
    })
  })
  */


  //Edition
  var edit = false
  $(".editable").attr("disabled", true)
  $(".showWhenEdit").hide()

  $(".startEdit").click( (e) => {
    if(edit == false) {
      $(".editable").attr("disabled", false)
      $(".hideWhenEdit").hide()
      $(".showWhenEdit").show()
      edit = true
    } else {
      $(".editable").attr("disabled", true)
      $(".hideWhenEdit").show()
      $(".showWhenEdit").hide()
      edit = false
    }
  })

  //Jour par d=fault est aujourd'hui
  $("select.dateInput-day.nowDefault").val(moment().format("DD"));
  $("select.dateInput-month.nowDefault").val(moment().format("MM"));
  $("select.dateInput-year.nowDefault").val(moment().format("YYYY"));

})
