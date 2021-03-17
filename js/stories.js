"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDltBtn = false) {
  // console.debug("generateStoryMarkup", story);
  const showStar = Boolean(currentUser);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}" class="closest-story">
        ${showStar ? getStarHTML(story, currentUser) : ""}
        ${showDltBtn ? getTrashCanHTML() : ""}

        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Make favorite/not-favorite star for story */
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star fave-star"></i>
      </span>`;
}

function getTrashCanHTML() {
  return '<span><i class="fas fa-trash-alt trash-can" aria-label="delete"></i></span>'
}

async function handleStarClick() {
  //get story object from target
  const storyId = this.closest('.closest-story').id;
  const story = storyList.stories.find(s => s.storyId === storyId);
  
  //if the story is not a favorite, favorite
  if (!currentUser.isFavorite(story)) {
    //addFavorite
    await currentUser.addFavorite(story);
    //update star class
    $(this).removeClass('far fas');
    $(this).addClass('fas');

    //if the story is a favorite, unfavorite
  } else { 

    await currentUser.removeFavorite(story);

    //update star class
    $(this).removeClass('far fas');
    $(this).addClass('far');
  }

}

$allStoriesList.on("click", ".fave-star", handleStarClick);

async function handleTrashClick() {
  //get story id from target
  const storyId = this.closest('.closest-story').id;
  
  await storyList.removeStory(currentUser, storyId);

  $(this).closest('.closest-story').remove();

}

$allStoriesList.on("click", ".trash-can", handleTrashClick);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();
  if (currentUser.favorites.length === 0) {
    $allStoriesList.append('<h3>No favorites added!</h3>')
  } else{
    // loop through all of our stories and generate HTML for them
    for (let favorite of currentUser.favorites) {
      const $favStory = generateStoryMarkup(favorite);
      $allStoriesList.append($favStory);
    }
  }
  $allStoriesList.show();
}


function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $allStoriesList.empty();
  if (currentUser.ownStories.length === 0) {
    $allStoriesList.append('<h3>No stories added by user yet!</h3>')
  } else{
    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true); //showDltBtn = true
      $allStoriesList.append($story);
    }
  }
  $allStoriesList.show();
}


async function createNewStory(evt){
  console.debug("createNewStory");
  evt.preventDefault();

  let title = $("#submitTitle").val();
  let author = $("#submitAuthor").val();
  let url = $("#submitUrl").val();
  
  await storyList.addStory(currentUser, {title, author, url});
  putStoriesOnPage();
}

$newStoryForm.on("submit", createNewStory);
