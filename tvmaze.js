"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const url = `http://api.tvmaze.com/search/shows?q=`;
const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]

  let response = await axios.get(url + `${term}`);
  console.log(response.data);
  return response.data.map((item) => {
    return {
      id: item.show.id,
      name: item.show.name,
      summary: item.show.summary,
      image: item.show.image ? item.show.image.medium : MISSING_IMAGE_URL,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  $episodesList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

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

async function getEpisodesOfShow(showId) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${showId}/episodes`);
  console.log(response.data);
  let showInfo = await axios.get(`http://api.tvmaze.com/shows/${showId}`);
  return response.data.map((episode) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
      show: showInfo.data.name
    };
  });
}

/** Given an array of episodes, loop through array 
 to append information about each episode 
 to an episodes list. */

function populateEpisodes(episodeArray) {
  $episodesArea.show();
  for (let episode of episodeArray) {
    $episodesList.append(
      `<li>${episode.name}, ${episode.season}, ${episode.number}, (${episode.show})</li>`
    );
  }
}

async function getAndShowEpisodes(e) {
  const showId = $(e.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getAndShowEpisodes);
