// Global app controller
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";
/** Global state of the app
 * - search object
 * - current recipe object
 * - shopping list object
 * - liked recipes
 */
const state = {};
/**
 * search controller
 */
const controlSearch = async () => {
  // get query from view
  const query = searchView.getInput();
  if (query) {
    // new search object and add to state
    state.search = new Search(query);
    // prepare UI for results
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchRes);

    try {
      // search for recipes
      await state.search.getResults();
      // clear loader
      clearLoader();
      // render results on UI
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Something wrong with the search...");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResults(state.search.result, goToPage);
    console.log(goToPage);
  }
});

/**
 * Recipe controller
 */

const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace("#", "");
  // console.log(id);
  if (id) {
    // prepare UI for changes
    recipeView.clearResult();
    renderLoader(elements.recipe);
    // highlight selected search item
    if (state.search) searchView.highlightSelected(id);
    // create new recipe object
    state.recipe = new Recipe(id);
    // TESTING
    window.r = state.recipe;
    try {
      // get recipe data and parse ingredients
      await state.recipe.getRecipe();
      // console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();
      // calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      // console.log(state.recipe);
    } catch (error) {
      alert("Error processing recipe!");
    }
  }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/**
 * List controller
 */
const controlList = () => {
  // Create a new list IF there in none yet
  if (!state.list) state.list = new List();
  // add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// handle delete and update list item events
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  // handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // delete from state
    state.list.deleteItem(id);
    // delete from UI
    listView.deleteItem(id);
    // handle the count update
  } else if (
    e.target.matches(".shopping__count-value, .shopping__count-value *")
  ) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/**
 * Like controller
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  // user has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // toggle the like button
    likesView.toggleLikeBtn(true);
    // add like to UI list
    likesView.renderLike(newLike);
    // User Has liked current recipe
  } else {
    // remove like from the state
    state.likes.deleteLike(currentID);
    // toggle the like button
    likesView.toggleLikeBtn(false);
    // remove like from UI list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

/**
 *  Restore liked recipes on page load
 */
window.addEventListener("load", () => {
  state.likes = new Likes();
  // Restore likes
  state.likes.readStorage();
  // Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      // console.log(state.recipe);
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // increase button is clicked
    state.recipe.updateServings("inc");
    // console.log(state.recipe);
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like controller
    controlLike();
  }
});

window.l = new List();
