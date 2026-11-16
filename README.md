# semnal
Pentru locuitorii orașului, mai ales elevii de liceu, care vor să semnaleze problemele din cartierul lor.
[README.md](https://github.com/user-attachments/files/34933985/README.md)
# Semnal — harta problemelor din oraș

Semnal este „centrul de comandă” al cetățenilor: o hartă pe tot ecranul pe care raportezi problemele din oraș, ca gropi, iluminat stricat, gunoi abandonat sau trotuare blocate. Apoi urmărești în timp real cum se rezolvă.

## Pentru cine este

Pentru locuitorii unui oraș care vor să semnaleze problemele din cartierul lor și să vadă ce s-a rezolvat. E potrivită și pentru elevi, care învață prin quiz cum se face o sesizare utilă și sigură.

## Cum se folosește

- Pe **hartă** vezi toate sesizările. Culoarea cercului arată categoria, iar bulina mică arată statusul: nouă, în lucru sau rezolvată. Fiecare sesizare are un cod, de exemplu `SEM-0012`.
- Poți schimba stilul hărții (**Întunecat**, **Stradă**, **Satelit**) și poți activa stratul **Densitate**, care arată unde se adună cele mai multe probleme.
- Filtrezi după categorie, status sau text și sortezi după dată, număr de confirmări sau gravitate.
- Apeși **Raportează**, alegi locul direct pe hartă (sau folosești locația ta), completezi categoria, descrierea și gravitatea și poți adăuga o fotografie.
- În panoul de detalii al unei sesizări vezi cronologia (trimisă, preluată, rezolvată), comentariile și butoanele **Am văzut și eu**, **Urmărește** și **Link**.
- Primești puncte: **+20** pentru o sesizare, **+5** pentru o confirmare și **+2** pentru un comentariu. Punctele te urcă în niveluri și îți deblochează insigne, pe care le vezi în **Profilul tău**.
- Secțiunea **Raport de oraș** arată sesizările din ultimele 14 zile, situația pe categorii și pe cartiere, procentul celor rezolvate, ce s-a rezolvat recent și clasamentul.
- Tasta `/` mută cursorul direct în căutare.
- Secțiunea **Quiz** are 5 întrebări despre cum faci o sesizare corectă. Fiecare răspuns corect valorează 10 puncte.

## Link

Aplicația: https://NUMELE-TAU.github.io/semnal/

## Tehnologii folosite

- HTML pentru structura paginii
- CSS pentru design: temă întunecată de „centru de comandă”, cu fonturile Space Grotesk și JetBrains Mono
- JavaScript pentru funcționalități (hartă, filtre, raportare, profil, quiz)
- Biblioteca [Leaflet](https://leafletjs.com/) pentru hartă, cu hărți publice Esri (fără cheie API). Dacă Esri nu răspunde, site-ul trece automat la OpenStreetMap.

Datele se păstrează doar în browserul fiecărui utilizator (localStorage). Aplicația nu are conturi și nici server.

**Atenție:** aceasta este o versiune demonstrativă. Sesizările **nu** sunt trimise automat primăriei. Pentru urgențe, sună la 112.

## Cum am folosit AI-ul

Am folosit un asistent AI ca să găsesc ideea, să construiesc site-ul, să îmbunătățesc designul și să adaug funcții noi, inclusiv harta și quizul. Am testat fiecare pas în browser și am cerut explicații pentru codul pe care nu îl înțelegeam.
