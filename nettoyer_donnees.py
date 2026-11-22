
import csv
from pathlib import Path

DOSSIER = Path(__file__).parent
DOSSIER_ORIGINAUX = DOSSIER / "data" / "originaux"
DOSSIER_NETTOYES = DOSSIER / "data" / "nettoyes"

DOSSIER_NETTOYES.mkdir(parents=True, exist_ok=True)

CODES_AGREGATS = [
    "AFE", "AFW", "ARB", "CEB", "CSS", "EAP", "EAR",
    "EAS", "ECA", "ECS", "EMU", "EUU", "HIC", "HPC",
    "IBD", "IBT", "IDA", "IDB", "IDX", "INX", "LAC",
    "LCN", "LDC", "LIC", "LMC", "LMY", "LTE", "MAC",
    "MEA", "MIC", "MNA", "NAC", "OED", "OSS", "PRE",
    "PSS", "PST", "SAS", "SSA", "SSF", "SST", "TEA",
    "TEC", "TLA", "TMN", "TSA", "TSS", "UMC",
]

FICHIERS = [
    ("total.csv", "total"),
    ("femmes.csv", "femmes"),
    ("hommes.csv", "hommes"),
]

for nom_fichier, nom_indicateur in FICHIERS:

    chemin_entree = DOSSIER_ORIGINAUX / nom_fichier

    with open(chemin_entree, "r", encoding="utf-8-sig",
              newline="") as fichier:
        lecteur = csv.reader(fichier)

        for _ in range(4):
            next(lecteur, None)

        entetes = next(lecteur)
        lignes = list(lecteur)

    indices_utiles = []

    for i, nom_colonne in enumerate(entetes):
        contient_donnee = any(
            i < len(ligne) and ligne[i].strip() != ""
            for ligne in lignes
        )

        if nom_colonne.strip() != "" and contient_donnee:
            indices_utiles.append(i)

    entetes_propres = [entetes[i] for i in indices_utiles]

    lignes_pays = []
    lignes_WLD = []

    for ligne in lignes:
        ligne_propre = [
            ligne[i] if i < len(ligne) else ""
            for i in indices_utiles
        ]

        pays = ligne_propre[0].strip()
        code = ligne_propre[1].strip()

        if pays != "" and code not in CODES_AGREGATS:
            lignes_pays.append(ligne_propre)

        if code == "WLD":
            lignes_WLD.append(ligne_propre)

    with open(DOSSIER_NETTOYES / f"pays_{nom_indicateur}.csv",
              "w", encoding="utf-8-sig", newline="") as fichier:
        csv.writer(fichier).writerow(entetes_propres)
        csv.writer(fichier).writerows(lignes_pays)

    with open(DOSSIER_NETTOYES / f"WLD_{nom_indicateur}.csv",
              "w", encoding="utf-8-sig", newline="") as fichier:
        csv.writer(fichier).writerow(entetes_propres)
        csv.writer(fichier).writerows(lignes_WLD)