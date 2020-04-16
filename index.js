/* ElementHandler responds to any incoming element, attached using HTMLRewriter's .on()
function. 
*/

class ElementHandler {
  element(element) {
    // An incoming element, such as `div`
    if (element.tagName === "h1" && element.getAttribute("id") === "title") {
      element.setInnerContent("Leo Sorkin");
    }
    if (element.tagName === "title") {
      element.setInnerContent("Fun Challenge");
    }
    if (
      element.tagName === "p" &&
      element.getAttribute("id") === "description"
    ) {
      element.setInnerContent(
        "Thank you for making this challenge! This made my quarantine a lot more fun :)"
      );
    }
    if (element.tagName === "a" && element.getAttribute("id") === "url") {
      element.setAttribute("href", "https://github.com/sorkinl");
      element.setInnerContent(
        "Be sure to check out my GitHub profile and projects!"
      );
    }
  }
}
/* Making new HTMLRewriter object and attaching elements to ElementHandler()
   using .on() function.
*/
const rewriter = new HTMLRewriter();
rewriter.on("h1#title", new ElementHandler());
rewriter.on("title", new ElementHandler());
rewriter.on("p#description", new ElementHandler());
rewriter.on("a#url", new ElementHandler());

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const baseURL = "https://cfw-takehome.developers.workers.dev/api/variants";
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  //Name of the cookie
  const NAME = "A/B-testing";
  // Check if the request is GET and fetch the URL
  if (request.method === "GET") {
    response = await fetch(baseURL)
      .then(function (res) {
        //parse the response as json
        return res.json();
      })
      .then(async function (data) {
        //take both variants out of the JSON
        let URL1 = data.variants[0];
        let URL2 = data.variants[1];
        // Fetch both variants
        const TEST_RESPONSE = await fetch(URL1);
        const CONTROL_RESPONSE = await fetch(URL2);
        // Check if there is a cookie in a request
        const cookie = request.headers.get("cookie");
        if (cookie && cookie.includes(`${NAME}=control`)) {
          return CONTROL_RESPONSE;
        } else if (cookie && cookie.includes(`${NAME}=test`)) {
          return TEST_RESPONSE;
        } else {
          // if no cookie then this is a new client, decide a group and set the cookie
          let group = Math.random() < 0.5 ? "test" : "control"; // 50/50 split
          response = group === "control" ? CONTROL_RESPONSE : TEST_RESPONSE;
          //Make the headers mutable by re-constructing the Response
          response = new Response(response.body, response);
          // Set cookie depending on the response group
          response.headers.set("Set-Cookie", `${NAME}=${group}; path=/`);
          return response;
        }
      });
  } else {
    return new Response("Expected GET", { status: 500 });
  }
  //transform the response using the HTMLRewriter
  return rewriter.transform(response);
}
