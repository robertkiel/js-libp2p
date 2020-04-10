# PeerStore

Libp2p's PeerStore is responsible for keeping an updated register with the relevant information of the known peers. It should be the single source of truth for all peer data, where a subsystem can learn about peers' data and where someone can listen for updates. The PeerStore comprises four main components: `addressBook`, `keyBook`, `protocolBook` and `metadataBook`.

The PeerStore manages the high level operations on its inner books. Moreover, the PeerStore should be responsible for notifying interested parties of relevant events, through its Event Emitter.

## Submitting records to the PeerStore

Several libp2p subsystems will perform operations that might gather relevant informations about peers.

### Identify
- The Identify protocol automatically runs on every connection when multiplexing is enabled. The protocol will put the multiaddrs and protocols provided by the peer to the PeerStore.
- In the background, the Identify Service is also waiting for protocol change notifications of peers via the IdentifyPush protocol. Peers may leverage the `identify-push` message to communicate protocol changes to all connected peers, so that their PeerStore can be updated with the updated protocols.
- While it is currently not supported in js-libp2p, future iterations may also support the [IdentifyDelta protocol](https://github.com/libp2p/specs/pull/176).
- Taking into account that the Identify protocol records are directly from the peer, they should be considered the source of truth and weighted accordingly.

### Peer Discovery
- Libp2p discovery protocols aim to discover new peers in the network. In a typical discovery protocol, addresses of the peer are discovered along its peer id. Once this happens, a libp2p discovery protocol should emit a `peer` event with the information of the discovered peer and this information it added to the PeerStore by libp2p.

### Dialer
- Libp2p API supports dialing a peer through its `multiaddr`. This way, if the node is able to establish a connection with the peer listening on the given `multiaddr`, this peer and its multiaddr should be added to the PeerStore.

### DHT
- On some DHT operations, such as finding providers for a given CID, nodes can exchange peer data as part of the query. This peer data can include unkwown peers multiaddrs and is also stored on the PeerStore.

## Retrieving records from the PeerStore

When the PeerStore data is updated, this information might be important for different parties. As a consequence, PeerStore is an event based component that notifies interested parties about changes. Any subsystem interested in these notifications should subscribe the PeerStore events.

### Peer
- Each time a new peer is discovered, the PeerStore should emit a `peer` event, so that interested parties can leverage this peer and establish a connection with it.

### Protocols
- When the known protocols of a peer change, the PeerStore emits a `change:protocols` event.
  - Libp2p topologies will be particularly interested in this, so that the subsystem can open streams with relevant peers for them

### Multiaddrs
- When the known listening `multiaddrs` of a peer change, the PeerStore emits a `change:multiaddrs` event.

## PeerStore implementation

The PeerStore wraps four main components: `addressBook`, `keyBook`, `protocolBook` and `metadataBook`. Moreover, it provides a high level API for those components, as well as data events.

### Components

#### Address Book

The `addressBook` keeps the known multiaddrs of a peer. The multiaddrs of each peer may change over time and the Address Book must account for this.

`Map<string, multiaddrInfo>`

A `peerId.toString()` identifier mapping to a `multiaddrInfo` object, which should have the following structure:

```js
{
  multiaddr: <Multiaddr>
}
```

#### Key Book

The `keyBook` tracks the keys of the peers.

**Not Yet Implemented**

#### Protocol Book

The `protoBook` holds the identifiers of the protocols supported by each peer. The protocols supported by each peer are dynamic and will change over time.

`Map<string, Set<string>>`

A `peerId.toString()` identifier mapping to a `Set` of protocol identifier strings.

#### Metadata Book

**Not Yet Implemented**

### API

For the complete API documentation, you should check the [API.md](../../doc/API.md).

Access to its underlying books:

- `peerStore.protoBook.*`
- `peerStore.addressBook.*`

### Events

- `peer` - emitted when a new peer is added.
- `change:multiaadrs` - emitted when a known peer has a different set of multiaddrs.
- `change:protocols` - emitted when a known peer supports a different set of protocols.

## Future Considerations

- If multiaddr TTLs are added, the PeerStore may schedule jobs to delete all addresses that exceed the TTL to prevent AddressBook bloating
- Further API methods will probably need to be added in the context of multiaddr validity and confidence.
