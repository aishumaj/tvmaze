"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const API_BASE_URL = "http://api.tvmaze.com";
const MISSING_IMAGE = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(term) {
  const searchResponse = await axios.get(`${API_BASE_URL}/search/shows`,
  { params: { q: term } });

  let listOfShows = searchResponse.data.map(function (elem) {
    let image = '';
    if (elem.show.image === null) {
      image = MISSING_IMAGE;
    } else {
      image = elem.show.image.medium;
    }
    return { id: elem.show.id,
      name: elem.show.name,
      summary: elem.show.summary,
      image };
  });
  return listOfShows;
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) {
  const episodeListResponse = await axios.get(`${API_BASE_URL}/shows/${id}/episodes`);
  let episodeList = episodeListResponse.data.map(function (elem) {
    return {
      id: elem.id,
      name: elem.name,
      season: elem.season,
      number: elem.number
    };
  });
  console.log(episodeList);
  return episodeList;
}

/** Takes an array of episode information and creates a list of episodes
 * underneath show information.
*/
function populateEpisodes(episodes) {
  $("#episodesList").empty();
  for (let ep of episodes) {
    const $ep = $(
      `<li>${ep.name} (season ${ep.season}, episode ${ep.number})</li>`
    );
    $("#episodesList").append($ep);
  }
  $("#episodesArea").show();
}


/**Pulls the show ID from parent div of episode button clicked, unhides episode
 * display section, and invokes populateEpisode function.
 */
async function fillEpisodeListAndDisplay(evt) {
  let id = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$("#showsList").on("click", ".Show-getEpisodes", fillEpisodeListAndDisplay);
