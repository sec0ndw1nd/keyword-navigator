import { deleteKeyword } from "./keyword.js";

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

export function createKeywordListItem(keyword, entry) {
  const $li = document.createElement("li");
  const $leftDiv = document.createElement("div");
  const $rightDiv = document.createElement("div");

  $li.classList.add("keywordItem");
  $leftDiv.classList.add("listLeft");

  /* ---- left */
  const $listHeading = document.createElement("h3");
  $listHeading.textContent = `${entry.name} (${keyword})`;
  $leftDiv.appendChild($listHeading);

  const $listUrl = document.createElement("p");
  $listUrl.textContent = `${entry.url}`;
  $leftDiv.appendChild($listUrl);

  /* ---- right */
  const $deleteButton = createButton({
    text: "Delete",
    onClick: () => deleteKeyword(keyword),
    className: "deleteButton",
  });
  $rightDiv.appendChild($deleteButton);

  /* ---- combine */
  $li.appendChild($leftDiv);
  $li.appendChild($rightDiv);

  return $li;
}
