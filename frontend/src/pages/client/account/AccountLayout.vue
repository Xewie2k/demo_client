<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-md-3">
        <AccountSidebar />
      </div>
      <div class="col-md-9">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import AccountSidebar from "@/components/client/AccountSidebar.vue";

export default {
  name: "AccountLayout",
  components: {
    AccountSidebar
  }
}
</script>
