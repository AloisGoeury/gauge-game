import { expect, test } from "@playwright/test";

test("two players can create, join, play and see the final score", async ({ browser }) => {
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();

  await alice.goto("/");
  await alice.getByRole("button", { name: "Créer une partie" }).click();
  await alice.getByLabel("Ton nom").fill("Alice");
  await alice.getByLabel("Nombre de manches").fill("1");
  await alice.getByRole("button", { name: "Personnalisé" }).click();
  await alice.getByRole("button", { name: "Supprimer Un plat" }).click();
  await alice.getByRole("button", { name: "Créer" }).click();
  await expect(alice.getByText("2 thèmes personnalisés sont obligatoires.")).toBeVisible();
  await alice.getByLabel("Titre du thème").fill("Un film");
  await alice.getByLabel("Label gauche").fill("nul");
  await alice.getByLabel("Label droit").fill("excellent");
  await alice.getByRole("button", { name: "Ajouter le thème" }).click();
  await alice.getByLabel("Titre du thème").fill("Un objet");
  await alice.getByLabel("Label gauche").fill("court");
  await alice.getByLabel("Label droit").fill("long");
  await alice.getByRole("button", { name: "Ajouter le thème" }).click();
  await alice.getByRole("button", { name: "Créer" }).click();

  const roomCode = (await alice.locator(".room-code").textContent())?.trim();
  expect(roomCode).toMatch(/[A-Z0-9]{6}/);
  await expect(alice.getByLabel("Lien d'invitation")).toHaveValue(new RegExp(`room=${roomCode}`));

  await bob.goto(`/?room=${roomCode}`);
  await expect(bob.getByLabel("Code de partie")).toHaveValue(roomCode!);
  await bob.getByLabel("Ton nom").fill("Bob");
  await bob.getByRole("button", { name: "Rejoindre" }).click();

  await expect(alice.locator(".player-row").filter({ hasText: "Bob" })).toBeVisible();
  await alice.getByRole("button", { name: "Lancer" }).click();

  await expect(alice.getByText("Tu fais deviner")).toBeVisible();
  await expect(bob.getByText("Tu devines")).toBeVisible();
  await expect(alice.locator(".target-marker")).toBeVisible();
  await expect(alice.getByLabel("Position sur la jauge")).toHaveCount(0);
  await expect(alice.locator(".guess-marker")).toHaveCount(0);
  await expect(alice.getByText(/\d+%/)).toHaveCount(0);
  await expect(bob.locator(".target-marker")).toHaveCount(0);
  await expect(bob.getByLabel("Position sur la jauge")).toHaveCount(0);

  await alice.getByLabel("Indice").fill("Pizza froide");
  await alice.getByRole("button", { name: "Envoyer l'indice" }).click();
  await expect(bob.getByText("Pizza froide")).toBeVisible();
  await expect(bob.getByLabel("Position sur la jauge")).toBeVisible();

  await bob.getByLabel("Position sur la jauge").evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = "500";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await bob.getByRole("button", { name: "Valider" }).click();

  await expect(alice.getByText("Résultat")).toBeVisible();
  await expect(bob.getByText("Résultat")).toBeVisible();
  await expect(bob.locator(".target-marker")).toBeVisible();
  await expect(bob.locator(".zone-four")).toBeVisible();
  await expect(bob.locator(".zone-two")).toBeVisible();
  await expect(bob.locator(".zone-one")).toBeVisible();
  await alice.getByRole("button", { name: "Prêt pour le score final" }).click();
  await expect(alice.getByRole("button", { name: "En attente de l'autre joueur" })).toBeVisible();
  await expect(alice.getByText("1/2 joueurs prêts")).toBeVisible();
  await bob.getByRole("button", { name: "Prêt pour le score final" }).click();
  await expect(alice.getByText("Partie terminée")).toBeVisible();

  await aliceContext.close();
  await bobContext.close();
});
