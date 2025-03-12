import { deleteLocalKeyword } from "./storage.js";

export function createButton({ text, onClick, className }) {
  const $button = document.createElement("button");
  $button.textContent = text;

  if (className) {
    $button.classList.add(className);
  }
  if (onClick) {
    $button.addEventListener("click", onClick);
  }
  return $button;
}

export function createKeywordListItem(item) {
  const $li = document.createElement("li");
  const $leftDiv = document.createElement("div");
  const $rightDiv = document.createElement("div");

  $li.classList.add("keywordItem");
  $leftDiv.classList.add("listLeft");

  /* ---- left */
  const $listHeading = document.createElement("h3");
  $listHeading.textContent = `${item.name} (${item.keyword})`;
  $leftDiv.appendChild($listHeading);

  const $listUrl = document.createElement("p");
  $listUrl.textContent = `${item.url}`;
  $leftDiv.appendChild($listUrl);

  /* ---- right */
  const $deleteButton = createButton({
    text: "Delete",
    onClick: () => deleteLocalKeyword(item.keyword),
    className: "deleteButton",
  });
  $rightDiv.appendChild($deleteButton);

  /* ---- combine */
  $li.appendChild($leftDiv);
  $li.appendChild($rightDiv);

  return $li;
}
