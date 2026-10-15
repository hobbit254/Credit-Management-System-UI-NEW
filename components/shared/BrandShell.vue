<!-- Sign-in, email verification and error pages: the ink brand panel beside one column of content. -->
<template>
  <div class="brand-shell">
    <div class="brand-panel">
      <NuxtLink
        to="/"
        class="brand-name"
      >
        Plugpoint
      </NuxtLink>
      <p class="brand-line d-none d-md-block">
        Every device, every shilling, every customer.
      </p>
      <p class="brand-note d-none d-md-block">
        Credit and stock records for the shop.
      </p>
    </div>

    <main class="brand-content">
      <div
        class="w-100"
        style="max-inline-size: 380px;"
      >
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.brand-shell {
  display: flex;
  flex-wrap: wrap;
  min-block-size: 100vh;
  background: rgb(var(--v-theme-background));
}

/* Always the ink panel, in light and dark mode alike. */
.brand-panel {
  display: flex;
  flex: 1 1 420px;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  background: #15262B;
  color: #E6ECEA;
  padding: clamp(24px, 6vw, 80px);
}

.brand-name {
  color: inherit;
  font-family: "Bricolage Grotesque", sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  text-decoration: none;
}

.brand-line {
  max-inline-size: 14ch;
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  letter-spacing: -0.025em;
  line-height: 1.02;
}

.brand-note {
  margin: 0;
  color: #9FB1AD;
}

.brand-content {
  display: flex;
  flex: 1 1 420px;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}

@media (max-width: 959px) {
  .brand-panel { flex-basis: 100%; }
}
</style>
