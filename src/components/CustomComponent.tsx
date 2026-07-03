import React from 'react';

// P = Props, S = State (puedes dejar los valores por defecto como {})
class CustomComponent<P = {}, S = {}> extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
  }

  public setStateAsync = (state: Partial<S>): Promise<void> => {
    return new Promise((resolve) => {
      this.setState(state as S, resolve);
    });
  };
}

export default CustomComponent;
