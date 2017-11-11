function agenda(events) {
  //Calendrier sur la page agenda
  $("#calendar").fullCalendar({
    header: {
      left: "title",
      center: "",
      right: "month,agendaWeek,agendaDay, prev,next"
    },
    theme: "bootstrap3",
    defaultView: "agendaWeek",
    scrollTime: "08:00:00",
    slotLabelInterval: "01:00:00",
    locale: "fr",
    timezone: "local",
    editable: true,
    slotDuration: "00:15:00",
    events: events,
    eventClick: function(event) {
      window.location.href = "/app/patient/seance/" + event.seanceId
    },
    eventDrop: savingEvent,
    eventResize: savingEvent
  })


  function savingEvent(event, delta, revertFunc) {
    if(confirm("Voulez-vous modifier la séance de "+event.title+" au "+event.start.format("DD/MM/YYYY")+" de "+event.start.format("HH:mm")+" à "+event.end.format("HH:mm")+" ?")) {
      $.ajax({
        url: "/app/agenda/seance",
        type: "POST",
        data: {
          "id": event.seanceId,
          "startTime": event.start.format(),
          "endTime": event.end.format()
        },
        error: function(err) {
          alert(err.responseText)
          revertFunc()
        }
      })
    } else {
      revertFunc()
    }
  }
}
