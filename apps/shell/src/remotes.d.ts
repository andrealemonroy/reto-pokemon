declare module 'remoteDetail/PokemonDetail' {
  import type { ComponentType } from 'react';
  import type { PokemonDetailRemoteProps } from '@pokedex/contracts';
  const Component: ComponentType<PokemonDetailRemoteProps>;
  export default Component;
}
declare module 'remoteHistory/PokemonHistory' {
  import type { ComponentType } from 'react';
  import type { PokemonHistoryRemoteProps } from '@pokedex/contracts';
  const Component: ComponentType<PokemonHistoryRemoteProps>;
  export default Component;
}
