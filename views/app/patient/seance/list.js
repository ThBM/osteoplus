extends ../../layout

block content
  h1 Seance #{patient.firstName} #{patient.lastName}

  include menu.pug

    table.table.table-striped
