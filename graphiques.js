//charger les 6 fichiers CSV : par pays + WLD
d3.csv("data/nettoyes/pays_total.csv", function(erreur, total) {
  d3.csv("data/nettoyes/pays_femmes.csv", function(erreur, femmes) {
    d3.csv("data/nettoyes/pays_hommes.csv", function(erreur, hommes) {
      d3.csv("data/nettoyes/WLD_total.csv", function(erreur, wldTotal) {
        d3.csv("data/nettoyes/WLD_femmes.csv", function(erreur, wldFemmes) {
          d3.csv("data/nettoyes/WLD_hommes.csv", function(erreur, wldHommes) {
 
            var pays = { total: total, femmes: femmes, hommes: hommes };
            var monde = { total: wldTotal, femmes: wldFemmes, hommes: wldHommes };
 
            graphique1(pays);
            graphique3(monde);
 
          });
        });
      });
    });
  });
});

//GRAPHIQUE 1
function graphique1(pays) {

  //menu des années
  for (var a = 1960; a <= 2024; a++) {
    d3.select("#choix-annee").append("option").attr("value", a).text(a);
  }
  d3.select("#choix-annee").property("value", "2024");

  function dessiner() {
    // lire les choix
    var indicateur = d3.select('input[name="indicateur"]:checked').property("value");
    var annee = d3.select("#choix-annee").property("value");
    var top25 = d3.select("#top25").property("checked");

    //couleurs différentes
    var couleur = "#69b3a2";
    if (indicateur === "femmes") { couleur = "#e377c2"; }
    if (indicateur === "hommes") { couleur = "#1f77b4"; }

    //préparer les données sans les valeurs vides
    var donnees = [];
    pays[indicateur].forEach(function(ligne) {
      var valeur = parseFloat(ligne[annee]);
      if (valeur > 0) {
        donnees.push({ pays: ligne["Country Name"], valeur: valeur });
      }
    });

    //tri décroissant
    donnees.sort(function(a, b) { return b.valeur - a.valeur; });

    if (top25) {
      donnees = donnees.slice(0, 25);
    }

    //dimensions
    var margeGauche = 180;
    var margeHaut = 20;
    var largeurInterieure = 1000 - margeGauche - 75;
    var hauteurInterieure = donnees.length * 25;

    //préparer SVG quand on vide
    var svg = d3.select("#graphique");
    svg.selectAll("*").remove();
    svg.attr("width", 1000).attr("height", hauteurInterieure + margeHaut + 45);

    var dessin = svg.append("g")
      .attr("transform", "translate(" + margeGauche + "," + margeHaut + ")");

    //échelles
    var x = d3.scaleLinear()
      .domain([0, d3.max(donnees, function(d) { return d.valeur; }) + 8])
      .range([0, largeurInterieure]);

    var y = d3.scaleBand()
      .domain(donnees.map(function(d) { return d.pays; }))
      .range([0, hauteurInterieure])
      .padding(0.15);

    //axes
    dessin.append("g")
      .attr("transform", "translate(0," + hauteurInterieure + ")")
      .call(d3.axisBottom(x));
    dessin.append("g").call(d3.axisLeft(y));

    //barres
    dessin.selectAll("rect")
      .data(donnees)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(d) { return y(d.pays); })
      .attr("width", function(d) { return x(d.valeur); })
      .attr("height", y.bandwidth())
      .attr("fill", couleur)
      .on("mouseover", function() { d3.select(this).attr("fill", "orange"); })
      .on("mouseout", function() { d3.select(this).attr("fill", couleur); });

    //valeurs au bout des barres
    dessin.selectAll("text.valeur")
      .data(donnees)
      .enter()
      .append("text")
      .attr("class", "valeur")
      .attr("x", function(d) { return x(d.valeur) + 6; })
      .attr("y", function(d) { return y(d.pays) + y.bandwidth() / 2; })
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text(function(d) { return d.valeur.toFixed(1) + " ans"; });
  }

  //redessiner quand on change une option
  d3.selectAll('input[name="indicateur"]').on("change", dessiner);
  d3.select("#choix-annee").on("change", dessiner);
  d3.select("#top25").on("change", dessiner);

  dessiner();
}

//GRAPHIQUE 2

//GRAPHIQUE 3
function graphique3(monde) {

  //transformer une ligne en liste de points : année + valeur
  function points(ligne) {
    var liste = [];
    for (var a = 1960; a <= 2024; a++) {
      liste.push({ annee: a, valeur: parseFloat(ligne[a]) });
    }
    return liste;
  }

  var total = points(monde.total[0]);
  var femmes = points(monde.femmes[0]);
  var hommes = points(monde.hommes[0]);

  //dimensions
  var largeur = 900;
  var hauteur = 450;
  var largeurInterieure = largeur - 65 - 30;
  var hauteurInterieure = hauteur - 30 - 50;

  var dessin = d3.select("#graphique3")
    .append("svg")
    .attr("width", largeur)
    .attr("height", hauteur)
    .append("g")
    .attr("transform", "translate(65,30)");

  //échelles
  var x = d3.scaleLinear().domain([1960, 2024]).range([0, largeurInterieure]);

  var toutes = total.concat(femmes, hommes);
  var y = d3.scaleLinear()
    .domain(d3.extent(toutes, function(d) { return d.valeur; }))
    .nice()
    .range([hauteurInterieure, 0]);

  //axes
  dessin.append("g")
    .attr("transform", "translate(0," + hauteurInterieure + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  dessin.append("g").call(d3.axisLeft(y));

  //forme d'une ligne
  var ligne = d3.line()
    .x(function(d) { return x(d.annee); })
    .y(function(d) { return y(d.valeur); });

  //les 3 lignes + la légende
  var courbes = [
    { nom: "Total", couleur: "green", donnees: total },
    { nom: "Femmes", couleur: "deeppink", donnees: femmes },
    { nom: "Hommes", couleur: "blue", donnees: hommes }
  ];

  courbes.forEach(function(c, i) {
    dessin.append("path")
      .datum(c.donnees)
      .attr("fill", "none")
      .attr("stroke", c.couleur)
      .attr("stroke-width", 3)
      .attr("d", ligne);

    dessin.append("text")
      .attr("x", 10 + i * 120)
      .attr("y", -10)
      .attr("fill", c.couleur)
      .text(c.nom);
  });
}