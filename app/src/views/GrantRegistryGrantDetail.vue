<template>
  <!-- Grant details -->
  <div v-if="!isEditing && grant && !loading">
    <BaseHeader
      :breadcrumbContent="breadcrumb"
      :name="grantMetadata?.name || ''"
      :owner="grant.owner"
      :nextPath="nextGrant"
      :lastPath="lastGrant"
    />

    <GrantDetailsRow
      :grant="grant"
      :logoURI="grantMetadata?.logoURI"
      :payoutAddress="grant.payee"
      :totalRaised="grantContributionsTotal"
      :roundDetails="grantContributionsByRound"
    >
      <template v-slot:extraButtons>
        <button v-if="isOwner" @click="enableEdit()" class="mt-5 btn btn-secondary">Edit Grant</button>
      </template>
    </GrantDetailsRow>

    <SectionHeader title="Description" />

    <div class="border-b border-grey-100">
      <p class="intent px-4 md:px-12 py-12 mx-auto max-w-6xl">
        {{ grantMetadata?.description }}
      </p>
    </div>

    <SectionHeader title="Links" />

    <div class="px-4 md:px-12 py-8 border-b border-grey-100 flex flex-col gap-y-4">
      <div class="flex gap-x-4">
        <span class="text-grey-400">Website:</span>
        <a href="#" target="_blank">{{ grantMetadata?.properties?.websiteURI || 'undefined' }}</a>
      </div>

      <div class="flex gap-x-4">
        <span class="text-grey-400">Github:</span>
        <a href="#" target="_blank">{{ grantMetadata?.properties?.githubURI || 'undefined' }}</a>
      </div>

      <div class="flex gap-x-4">
        <span class="text-grey-400">Twitter:</span>
        <a href="#" target="_blank">{{ grantMetadata?.properties?.twitterURI || 'undefined' }}</a>
      </div>
    </div>

    <BaseFilterNav :active="selectedRound" :items="contributionsNav" />

    <div v-if="selectedRound == 0">
      <div v-for="(contribution, index) in grantContibutions" :key="Number(index)">
        <ContributionRow :contribution="contribution" :donationToken="rounds && rounds[0].donationToken" />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(contribution, index) in grantContributionsByRound[selectedRound - 1].contributions"
        :key="Number(index)"
      >
        <ContributionRow :contribution="contribution" :donationToken="rounds && rounds[0].donationToken" />
      </div>
    </div>
  </div>

  <!-- Editing grant -->
  <div v-else-if="grant && !loading" class="flex flex-col justify-center sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
        alt="Workflow"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Edit Grant {{ grantMetadata?.name }}</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-left">
      <div class="py-8 px-4 border border-gray-200 shadow sm:rounded-lg sm:px-6 bg-gray-50">
        <form class="space-y-6" @submit.prevent="saveEdits">
          <!-- Owner address -->
          <BaseInput
            v-model="form.owner"
            description="The owner has permission to edit the grant"
            id="owner-address"
            label="Owner address"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- Payee address -->
          <BaseInput
            v-model="form.payee"
            description="The address contributions and matching funds are sent to"
            id="payee-address"
            label="Payee address"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- Grant name -->
          <BaseInput
            v-model="form.name"
            description="Your grant's name"
            id="grant-name"
            label="Grant name"
            :rules="isDefined"
            errorMsg="Please enter a name"
          />

          <!-- Grant Description -->
          <BaseInput
            v-model="form.description"
            description="Your grant's description"
            id="grant-description"
            label="Grant description"
            :rules="isDefined"
            errorMsg="Please enter a description"
          />

          <!-- Grant website -->
          <BaseInput
            v-model="form.website"
            description="Your grant's website"
            id="grant-website"
            label="Grant website"
            :rules="isValidUrl"
            errorMsg="Please enter a valid URL"
            :required="false"
          />

          <!-- Grant github -->
          <BaseInput
            v-model="form.github"
            description="Your grant's github"
            id="grant-github"
            label="Grant github"
            :rules="isValidGithubUrl"
            errorMsg="Please enter a valid Github URL"
            :required="false"
          />

          <!-- Grant twitter handle -->
          <BaseInput
            v-model="form.twitter"
            description="Your grant's twitter handle"
            id="grant-handle"
            label="Grant twitter"
            :required="false"
          />

          <!-- Submit and cancel buttons -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ disabled: !isFormValid }"
            :disabled="!isFormValid"
          >
            Save Edits
          </button>
          <button @click.prevent="cancelEdits" class="btn btn-outline w-full">Cancel</button>
        </form>
      </div>
    </div>
  </div>

  <!-- No grant selected -->
  <div v-else-if="!grant">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">No grant selected</h2>
  </div>

  <div v-else>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Loading...</h2>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import {
  GRANT_REGISTRY_ADDRESS,
  GRANT_REGISTRY_ABI,
  GRANT_ROUND_MANAGER_ABI,
  GRANT_ROUND_MANAGER_ADDRESS,
  SUPPORTED_TOKENS_MAPPING,
} from 'src/utils/constants';
import { Contract, ContractTransaction, formatUnits } from 'src/utils/ethers';
import { isValidAddress, isValidUrl, isDefined, formatNumber, urlFromTwitterHandle } from 'src/utils/utils';
import { GrantRegistry } from '@dgrants/contracts';
import { hexlify } from 'ethers/lib/utils';
import * as ipfs from 'src/utils/ipfs';
// --- Types ---
import { Breadcrumb, FilterNavItem, GrantRound, GrantsRoundDetails } from '@dgrants/types';
// --- Components ---
import BaseInput from 'src/components/BaseInput.vue';
import BaseHeader from 'src/components/BaseHeader.vue';
import SectionHeader from 'src/components/SectionHeader.vue';
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import ContributionRow from 'src/components/ContributionRow.vue';
import GrantDetailsRow from 'src/components/GrantDetailsRow.vue';
import { CLR, fetch, InitArgs, linear } from '@dgrants/dcurve';

function useGrantDetail() {
  // --- get current state ---
  const {
    poll,
    grants,
    grantMetadata: metadata,
    grantRounds: rounds,
    grantRoundMetadata: roundsMetadata,
  } = useDataStore();
  const { signer, provider, userAddress } = useWalletStore();
  const route = useRoute();

  // --- expose grant data ---
  const grant = computed(() => {
    if (!grants.value) return null; // array type unsupported
    return grants.value[grantId.value];
  });
  const grantId = computed(() => Number(route.params.id));
  const grantMetadata = computed(() => (grant.value ? metadata.value[grant.value.metaPtr] : null));

  // --- expose Grant/round details ---
  const loading = ref(true);
  const selectedRound = ref(0);
  const grantContibutions = ref();
  const grantContributionsTotal = ref();
  const grantContributionsByRound = ref();

  // init and assign the calc algorithm to CLR
  const clr = new CLR({
    calcAlgo: linear,
  } as InitArgs);

  // returns the predicition curve for this grant in the given round
  const getPredictionForGrantInRound = async (clr: CLR, grantId: string, round: GrantRound) => {
    return await clr.predict({
      grantId: grantId,
      predictionPoints: [0, 10, 100],
      grantRoundContributions: await fetch({
        provider: provider.value,
        grantRound: round.address,
        grantRoundManager: GRANT_ROUND_MANAGER_ADDRESS,
        grantRegistry: GRANT_REGISTRY_ADDRESS,
        supportedTokens: SUPPORTED_TOKENS_MAPPING,
        // should these be pulled from an endpoint?
        ignore: {
          grants: [],
          contributionAddress: [],
        },
      }),
    });
  };

  // gets all contributions to this grant
  const getContributions = async () => {
    // all contributions will pass through the roundManager, and the roundManager will ensure theres only one donationToken currency shared between rounds
    const roundManager = new Contract(GRANT_ROUND_MANAGER_ADDRESS, GRANT_ROUND_MANAGER_ABI, provider.value);
    // get every contribution for this grantId (ignoring the round for now)
    const contributions = await roundManager.queryFilter(roundManager.filters.GrantDonation(hexlify(grantId.value)));

    // attach the from address (the contributor) to the contribution object
    return await Promise.all(
      contributions.reverse().map(async (contribution) => {
        const tx = await contribution.getTransaction();

        return { ...contribution, from: tx.from, donationToken: rounds.value && rounds.value[0].donationToken };
      })
    );
  };

  // Note: Should this state be cached between calls? How will we manage invalidations?
  watch(
    () => [grantId.value, rounds.value, roundsMetadata.value, provider.value],
    async () => {
      // ensure the computed props are ready before fetching data
      if (rounds.value && roundsMetadata.value && provider.value) {
        // enter loading state between loads
        loading.value = true;
        // get all contributions for this grant
        const contributions = await getContributions();
        // sum all contributions made against this grant
        const contributionsTotal = `${formatNumber(
          formatUnits(
            contributions.reduce((carr, contrib) => contrib?.args?.donationAmount.add(carr), 0).toString(),
            rounds.value && rounds.value[0].donationToken.decimals
          ),
          2
        )} ${rounds.value && rounds.value[0].donationToken.symbol}`;
        // collect this grants details from every round that it is a member of (should we use the metadata here?)
        const contributionsByRound = await Promise.all(
          (rounds.value || []).map(async (round) => {
            // this prediciton will refetch all contributions made in this round - should we cache the result of dcurve/fetch?
            const prediction = await getPredictionForGrantInRound(clr, String(grantId.value), round);
            // filter only contributions which should be considered for this round (should we also/only check metadata here?)
            const roundContributions = contributions
              .map((contrib) => (contrib?.args?.rounds.includes(round.address) ? contrib : false))
              .filter((c) => c);
            // sum the contributions which were made against this round
            const roundsContributionTotal = formatUnits(
              roundContributions
                .reduce((carr, contrib) => (contrib ? contrib.args?.donationAmount.add(carr) : carr), 0)
                .toString(),
              round.donationToken.decimals
            );

            return {
              address: round.address,
              metaPtr: round.metaPtr,
              name: roundsMetadata.value[round.metaPtr].name,
              matchingToken: round.matchingToken,
              donationToken: round.donationToken,
              contributions: roundContributions,
              balance: formatNumber(roundsContributionTotal, 2),
              matching: formatNumber(prediction.predictions[0].predictedGrantMatch, 2),
              prediction10: formatNumber(prediction.predictions[1].predictionDiff, 2),
              prediction100: formatNumber(prediction.predictions[2].predictionDiff, 2),
            } as GrantsRoundDetails;
          })
        );
        // save off data
        grantContibutions.value = contributions;
        grantContributionsTotal.value = contributionsTotal;
        grantContributionsByRound.value = contributionsByRound;
        // finished loading required state
        loading.value = false;
      }
    },
    { immediate: true }
  );

  // --- BaseHeader Navigation ---
  const breadcrumb = computed(
    () =>
      <Breadcrumb[]>[
        {
          displayName: 'dgrants',
          routeTarget: { name: 'Home' },
        },
        {
          displayName: 'registry',
          routeTarget: { name: 'dgrants' },
        },
        {
          displayName: `#${grantId.value}`,
          routeTarget: { name: 'dgrants-id', params: { id: grantId.value } },
        },
      ]
  );
  const getGrantTargetFor = (grantid: number) => {
    if (!grants.value) return undefined; // array type unsupported
    return grants.value[grantid] ? { name: 'dgrants-id', params: { id: grantid } } : undefined;
  };
  const nextGrant = computed(() => {
    return getGrantTargetFor(grantId.value + 1);
  });
  const lastGrant = computed(() => {
    return getGrantTargetFor(grantId.value - 1);
  });

  // --- Contribution display details ---
  const contributionsNav = computed(
    () =>
      <FilterNavItem[]>[
        {
          label: 'All Rounds',
          counter: grantContibutions.value?.length,
          action: () => {
            selectedRound.value = 0;
          },
        },
        ...(grantContributionsByRound.value || []).map((round: GrantsRoundDetails, index: number) => {
          return {
            label: round?.name,
            counter: round?.contributions?.length,
            action: () => {
              selectedRound.value = index + 1;
            },
          };
        }),
      ]
  );

  // --- Edit capabilities ---
  const isOwner = computed(() => userAddress.value === grant.value?.owner);
  const isEditing = ref(false);

  const form = ref<{
    owner: string;
    payee: string;
    name: string;
    description: string;
    website: string;
    github: string;
    twitter: string;
  }>({
    owner: grant.value?.owner || '',
    payee: grant.value?.payee || '',
    name: grantMetadata.value?.name || '',
    description: grantMetadata.value?.description || '',
    website: grantMetadata.value?.properties?.websiteURI || '',
    github: grantMetadata.value?.properties?.githubURI || '',
    twitter: grantMetadata.value?.properties?.twitterURI || '',
  });

  const isFormValid = computed(() => {
    if (!grant.value) return false;
    const { owner, payee, name, description, website, github, twitter } = form.value;
    const areFieldsValid = isValidAddress(owner) && isValidAddress(payee) && isDefined(name) && isDefined(description);

    const areFieldsUpdated =
      owner !== grant.value.owner ||
      payee !== grant.value.payee ||
      name !== grantMetadata.value?.name ||
      description !== grantMetadata.value?.description ||
      website !== grantMetadata.value?.properties?.websiteURI ||
      github !== grantMetadata.value?.properties?.githubURI ||
      twitter !== grantMetadata.value?.properties?.twitterURI;

    return areFieldsValid && areFieldsUpdated;
  });

  /**
   * @notice Resets the form values that user may have changed, and hides the edit window
   */
  function cancelEdits() {
    prefillEditForm();

    // Hide edit form
    isEditing.value = false;
  }

  /**
   * @notice Saves edits
   */
  const saveEdits = async () => {
    // Validation
    const { owner, payee, name, description, website, github, twitter } = form.value;
    if (!grant.value) throw new Error('No grant selected');
    if (!signer.value) throw new Error('Please connect a wallet');

    // Get registry instance
    const registry = <GrantRegistry>new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, signer.value);

    // Determine which update method to call
    let tx: ContractTransaction;
    const g = grant.value; // for better readability in the if statements
    let metaPtr = g.metaPtr;

    const gMetadata = grantMetadata.value;
    const isMetaPtrUpdated =
      name !== gMetadata?.name ||
      description !== gMetadata?.description ||
      website !== gMetadata?.properties?.websiteURI ||
      github !== gMetadata?.properties?.githubURI ||
      twitter !== gMetadata?.properties?.twitterURI;
    if (isMetaPtrUpdated) {
      const twitterURI = twitter === '' ? twitter : urlFromTwitterHandle(twitter);
      const properties = { websiteURI: website, githubURI: github, twitterURI };
      metaPtr = await ipfs
        .uploadGrantMetadata({ name, description })
        .then((cid) => ipfs.getMetaPtr({ cid: cid.toString() }));
    }

    if (owner !== g.owner && payee === g.payee && !isMetaPtrUpdated) {
      // update Grant Owner
      tx = await registry.updateGrantOwner(g.id, owner);
    } else if (owner === g.owner && payee !== g.payee && !isMetaPtrUpdated) {
      // update Grant Payee
      tx = await registry.updateGrantPayee(g.id, payee);
    } else if (owner === g.owner && payee === g.payee && isMetaPtrUpdated) {
      // update Grant MetaPtr
      tx = await registry.updateGrantMetaPtr(g.id, metaPtr);
    } else {
      // update all
      tx = await registry.updateGrant(g.id, owner, payee, metaPtr);
    }

    // After tx mines, poll so the store has the latest data, then navigate to the grant page
    await tx.wait();
    await poll();
    cancelEdits(); // reset form ref and toggle page state back to display mode
  };

  /**
   * @notice Loads the default values into edit form, and shows the edit window
   */
  function enableEdit() {
    prefillEditForm();

    // Enable edit form
    isEditing.value = true;
  }

  /**
   * @notice util function which prefills edit form
   */
  function prefillEditForm() {
    form.value.owner = grant.value?.owner || '';
    form.value.payee = grant.value?.payee || '';
    form.value.name = grantMetadata.value?.name || '';
    form.value.description = grantMetadata.value?.description || '';
    form.value.website = grantMetadata.value?.properties?.websiteURI || '';
    form.value.github = grantMetadata.value?.properties?.githubURI || '';
    form.value.twitter = grantMetadata.value?.properties?.twitterURI || '';
  }

  return {
    loading,
    grantId,
    rounds,
  }

  return {
    isEditing,
    isOwner,
    isValidAddress,
    isValidUrl,
    isValidGithubUrl,
    isDefined,
    isFormValid,
    grant,
    grantMetadata,
    form,
    cancelEdits,
    saveEdits,
    enableEdit,
    breadcrumb,
    contributionsNav,
    nextGrant,
    lastGrant,
    selectedRound,
    grantContibutions,
    grantContributionsTotal,
    grantContributionsByRound,
  };
}

export default defineComponent({
  name: 'GrantRegistryGrantDetail',
  components: { BaseInput, SectionHeader, ContributionRow, BaseHeader, BaseFilterNav, GrantDetailsRow },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();

    return { isInCart, addToCart, removeFromCart, ...useGrantDetail() };
  },
});
</script>
