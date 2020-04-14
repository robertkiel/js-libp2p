# API

* [Static Functions](#static-functions)
  * [`create`](#create)
* [Instance Methods](#instance-methods)
  * [`start`](#start)
  * [`stop`](#stop)
  * [`dial`](#dial)
  * [`dialProtocol`](#dialprotocol)
  * [`hangUp`](#hangup)
  * [`handle`](#handle)
  * [`unhandle`](#unhandle)
  * [`ping`](#ping)
  * [`peerRouting.findPeer`](#peerroutingfindpeer)
  * [`contentRouting.findProviders`](#contentroutingfindproviders)
  * [`contentRouting.provide`](#contentroutingprovide)
  * [`contentRouting.put`](#contentroutingput)
  * [`contentRouting.get`](#contentroutingget)
  * [`contentRouting.getMany`](#contentroutinggetmany)
  * [`peerStore.addressBook.add`](#peerstoreaddressbookadd)
  * [`peerStore.addressBook.delete`](#peerstoreaddressbookdelete)
  * [`peerStore.addressBook.get`](#peerstoreaddressbookget)
  * [`peerStore.addressBook.getMultiaddrsForPeer`](#peerstoreaddressbookgetmultiaddrsforpeer)
  * [`peerStore.addressBook.set`](#peerstoreaddressbookset)
  * [`peerStore.protoBook.add`](#peerstoreprotobookadd)
  * [`peerStore.protoBook.delete`](#peerstoreprotobookdelete)
  * [`peerStore.protoBook.get`](#peerstoreprotobookget)
  * [`peerStore.protoBook.set`](#peerstoreprotobookset)
  * [`peerStore.delete`](#peerstoredelete)
  * [`peerStore.get`](#peerstoreget)
  * [`peerStore.peers`](#peerstorepeers)
  * [`pubsub.getSubscribers`](#pubsubgetsubscribers)
  * [`pubsub.getTopics`](#pubsubgettopics)
  * [`pubsub.publish`](#pubsubpublish)
  * [`pubsub.subscribe`](#pubsubsubscribe)
  * [`pubsub.unsubscribe`](#pubsubunsubscribe)
  * [`connectionManager.setPeerValue`](#connectionmanagersetpeervalue)
  * [`metrics.global`](#metricsglobal)
  * [`metrics.peers`](#metricspeers)
  * [`metrics.protocols`](#metricsprotocols)
  * [`metrics.forPeer`](#metricsforpeer)
  * [`metrics.forProtocol`](#metricsforprotocol)
* [Events](#events)
* [Types](#types)
  * [`Stats`](#stats)

## Static Functions

### create

Creates an instance of Libp2p.

`create(options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| options | `object` | libp2p options |
| options.modules | `Array<object>` | libp2p modules to use |
| [options.config] | `object` | libp2p modules configuration and core configuration |
| [options.connectionManager] | `object` | libp2p Connection Manager configuration |
| [options.datastore] | `object` | must implement [ipfs/interface-datastore](https://github.com/ipfs/interface-datastore) (in memory datastore will be used if not provided) |
| [options.dialer] | `object` | libp2p Dialer configuration
| [options.metrics] | `object` | libp2p Metrics configuration
| [options.peerInfo] | [`PeerInfo`][peer-info] | peerInfo instance (it will be created if not provided) |

For Libp2p configurations and modules details read the [Configuration Document](./CONFIGURATION.md).

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Libp2p>` | Promise resolves with the Libp2p instance |

#### Example

```js
const Libp2p = require('libp2p')

// specify options
const options = {}

// create libp2p
const libp2p = await Libp2p.create(options)
```

Note: The [`PeerInfo`][peer-info] option is not required and will be generated if it is not provided.

<details><summary>Alternative</summary>
As an alternative, it is possible to create a Libp2p instance with the constructor:

#### Example

```js
const Libp2p = require('libp2p')

// specify options
const options = {}

// create libp2p
const libp2p = new Libp2p(options)
```

Required keys in the `options` object:

- `peerInfo`: instance of [`PeerInfo`][peer-info] that contains the [`PeerId`][peer-id], Keys and [multiaddrs][multiaddr] of the libp2p Node (optional when using `.create`).
- `modules.transport`: An array that must include at least 1 compliant transport. See [modules that implement the transport interface](https://github.com/libp2p/js-interfaces/tree/master/src/transport#modules-that-implement-the-interface).

</details>

## Libp2p Instance Methods

### start

Starts the libp2p node.

`libp2p.start()`

#### Returns

| Type | Description |
|------|-------------|
| `Promise` | Promise resolves when the node is ready |

#### Example

```js
const Libp2p = require('libp2p')

// ...

const libp2p = await Libp2p.create(options)

// start libp2p
await libp2p.start()
```

### stop

Stops the libp2p node.

`libp2p.stop()`

#### Returns

| Type | Description |
|------|-------------|
| `Promise` | Promise resolves when the node is fully stopped |

#### Example

```js
const Libp2p = require('libp2p')

// ...
const libp2p = await Libp2p.create(options)
// ...

// stop libp2p
await libp2p.stop()
```

### connections

A Getter that returns a Map of the current Connections libp2p has to other peers.

`libp2p.connections`

#### Returns

| Type | Description |
|------|-------------|
| `Map<string, Array<Connection>>` | A map of [`PeerId`][peer-id] strings to [`Connection`][connection] Arrays |

#### Example

```js
for (const [peerId, connections] of libp2p.connections) {
  for (const connection of connections) {
    console.log(peerId, connection.remoteAddr.toString())
    // Logs the PeerId string and the observed remote multiaddr of each Connection
  }
}
```

### dial

`dial(peer, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peer | [`PeerInfo`][peer-info]\|[`PeerId`][peer-id]\|[`Multiaddr`][multiaddr]\|`string` | The peer to dial. If a [`Multiaddr`][multiaddr] or its string is provided, it **must** include the peer id |
| [options] | `object` | dial options |
| [options.signal] | [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | An `AbortSignal` instance obtained from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) that can be used to abort the connection before it completes |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Connection>` | Promise resolves with the [Connection][connection] instance |

#### Example

```js
// ...
const conn = await libp2p.dial(remotePeerInfo)

// create a new stream within the connection
const { stream, protocol } = await conn.newStream(['/echo/1.1.0', '/echo/1.0.0'])

// protocol negotiated: 'echo/1.0.0' means that the other party only supports the older version

// ...
await conn.close()
```

### dialProtocol

Dials to another peer in the network and selects a protocol to communicate with that peer. The stream between both parties is returned, together with the negotiated protocol.

`dialProtocol(peer, protocols, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peer | [`PeerInfo`][peer-info]\|[`PeerId`][peer-id]\|[`Multiaddr`][multiaddr]\|`string` | The peer to dial. If a [`Multiaddr`][multiaddr] or its string is provided, it **must** include the peer id |
| protocols | `string|Array<string>` |  A list of protocols (or single protocol) to negotiate with. Protocols are attempted in order until a match is made. (e.g '/ipfs/bitswap/1.1.0') |
| [options] | `object` | dial options |
| [options.signal] | [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) | An `AbortSignal` instance obtained from an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) that can be used to abort the connection before it completes |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<{ stream:*, protocol:string }>` | Promise resolves with a [duplex stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it) and the protocol used |

#### Example

```js
// ...
const pipe = require('it-pipe')

const { stream, protocol } = await libp2p.dialProtocol(remotePeerInfo, protocols)

// Use this new stream like any other duplex stream
pipe([1, 2, 3], stream, consume)
```

### hangUp

Attempts to gracefully close an open connection to the given peer. If the connection is not closed in the grace period, it will be forcefully closed.

`hangUp(peer)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peer | [`PeerInfo`][peer-info]\|[`PeerId`][peer-id]\|[`Multiaddr`][multiaddr]\|`string` | peer to hang up |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | Promise resolves once connection closes |

#### Example

```js
// ...
await libp2p.hangUp(remotePeerInfo)
```

### handle

Sets up [multistream-select routing](https://github.com/multiformats/multistream-select) of protocols to their application handlers. Whenever a stream is opened on one of the provided protocols, the handler will be called. `handle` must be called in order to register a handler and support for a given protocol. This also informs other peers of the protocols you support.

`libp2p.handle(protocols, handler)`

In the event of a new handler for the same protocol being added, the first one is discarded.

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| protocols | `Array<string>|string` | protocols to register |
| handler | `function({ connection:*, stream:*, protocol:string })` | handler to call |


#### Example

```js
// ...
const handler = ({ connection, stream, protocol }) => {
  // use stream or connection according to the needs
}

libp2p.handle('/echo/1.0.0', handler)
```

### unhandle

Unregisters all handlers with the given protocols

`libp2p.unhandle(protocols)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| protocols | `Array<string>|string` | protocols to unregister |

#### Example

```js
// ...
libp2p.unhandle(['/echo/1.0.0'])
```

### ping

Pings a given peer and get the operation's latency.

`libp2p.ping(peer)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peer | [`PeerInfo`][peer-info]\|[`PeerId`][peer-id]\|[`Multiaddr`][multiaddr]\|`string` | peer to ping |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<number>` | Latency of the operation in ms |

#### Example

```js
// ...
const latency = await libp2p.ping(otherPeerId)
```

### peerRouting.findPeer

Iterates over all peer routers in series to find the given peer. If the DHT is enabled, it will be tried first.

`libp2p.peerRouting.findPeer(peerId, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | ID of the peer to find |
| options | `object` | operation options |
| options.timeout | `number` | maximum time the query should run |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<{ id: CID, addrs: Multiaddr[] }>` | Peer data of a known peer |

#### Example

```js
// ...
const peerData = await libp2p.peerRouting.findPeer(peerId, options)
```

### contentRouting.findProviders

Iterates over all content routers in series to find providers of the given key.
Once a content router succeeds, the iteration will stop. If the DHT is enabled, it will be queried first.

`libp2p.contentRouting.findProviders(cid, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| cid | [`CID`][cid] | cid to find |
| options | `object` | operation options |
| options.timeout | `number` | maximum time the query should run |
| options.maxNumProviders | `number` | maximum number of providers to find |

#### Returns

| Type | Description |
|------|-------------|
| `AsyncIterable<{ id: CID, addrs: Multiaddr[] }` |  Async iterator for peer data |

#### Example

```js
// Iterate over the providers found for the given cid
for await (const provider of libp2p.contentRouting.findProviders(cid)) {
  console.log(provider.id, provider.addrs)
}
```

### contentRouting.provide

Iterates over all content routers in parallel, in order to notify it is a provider of the given key.

`libp2p.contentRouting.provide(cid)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| cid | [`CID`][cid] | cid to provide |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | Promise resolves once notifications are sent |

#### Example

```js
// ...
await libp2p.contentRouting.provide(cid)
```

### contentRouting.put

Writes a value to a key in the DHT.

`libp2p.contentRouting.put(key, value, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| key | `string` | key to add to the dht |
| value | `Buffer` | value to add to the dht |
| [options] | `object` | put options |
| [options.minPeers] | `number` | minimum number of peers required to successfully put (default: closestPeers.length) |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<void>` | Promise resolves once value is stored |

#### Example

```js
// ...
const key = '/key'
const value = Buffer.from('oh hello there')

await libp2p.contentRouting.put(key, value)
```

### contentRouting.get

Queries the DHT for a value stored for a given key.

`libp2p.contentRouting.get(key, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| key | `string` | key to get from the dht |
| [options] | `object` | get options |
| [options.timeout] | `number` | maximum time the query should run |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Buffer>` | Value obtained from the DHT |

#### Example

```js
// ...

const key = '/key'
const value = await libp2p.contentRouting.get(key)
```

### contentRouting.getMany

Queries the DHT for the n values stored for the given key (without sorting).

`libp2p.contentRouting.getMany(key, nvals, options)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| key | `string` | key to get from the dht |
| nvals | `number` | number of values aimed |
| [options] | `object` | get options |
| [options.timeout] | `number` | maximum time the query should run |

#### Returns

| Type | Description |
|------|-------------|
| `Promise<Array<{from: PeerId, val: Buffer}>>` | Array of records obtained from the DHT |

#### Example

```js
// ...

const key = '/key'
const { from, val } = await libp2p.contentRouting.get(key)
```

### peerStore.addressBook.add

Adds known `multiaddrs` of a given peer. If the peer is not known, it will be set with the provided multiaddrs.

`peerStore.addressBook.add(peerId, multiaddrs)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to set |
| multiaddrs | |`Array<Multiaddr>` | [`Multiaddrs`][multiaddr] to add |

#### Returns

| Type | Description |
|------|-------------|
| `AddressBook` | Returns the Address Book component |

#### Example

```js
peerStore.addressBook.add(peerId, multiaddr)
```

### peerStore.addressBook.delete

Delete the provided peer from the book.

`peerStore.addressBook.delete(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to remove |

#### Returns

| Type | Description |
|------|-------------|
| `boolean` | true if found and removed |

#### Example

```js
peerStore.addressBook.delete(peerId)
// false
peerStore.addressBook.set(peerId, multiaddr)
peerStore.addressBook.delete(peerId)
// true
```

### peerStore.addressBook.get

Get the known [`MultiaddrInfos`][multiaddr-info] of a provided peer.

`peerStore.addressBook.get(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to get |

#### Returns

| Type | Description |
|------|-------------|
| `Array<MultiaddrInfo>` | Array of peer's multiaddr with their relevant information [`MultiaddrInfo`][multiaddr-info] |

#### Example

```js
peerStore.addressBook.get(peerId)
// undefined
peerStore.addressBook.set(peerId, multiaddr)
peerStore.addressBook.get(peerId)
// [
// {
//   multiaddr: /ip4/140.10.2.1/tcp/8000,
//   ...
// },
// {
//   multiaddr: /ip4/140.10.2.1/ws/8001
//   ...
// },
// ]
```

## peerStore.addressBook.getMultiaddrsForPeer

Get the known `Multiaddr` of a provided peer. All returned multiaddrs will include the encapsulated `PeerId` of the peer.

`peerStore.addressBook.getMultiaddrsForPeer(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to get |

#### Returns

| Type | Description |
|------|-------------|
| `Array<Multiaddr>` | Array of peer's multiaddr |

#### Example

```js
peerStore.addressBook.getMultiaddrsForPeer(peerId)
// undefined
peerStore.addressBook.set(peerId, multiaddr)
peerStore.addressBook.getMultiaddrsForPeer(peerId)
// [
// /ip4/140.10.2.1/tcp/8000/p2p/QmW8rAgaaA6sRydK1k6vonShQME47aDxaFidbtMevWs73t
// /ip4/140.10.2.1/ws/8001/p2p/QmW8rAgaaA6sRydK1k6vonShQME47aDxaFidbtMevWs73t
// ]
```

### peerStore.addressBook.set

Set known `multiaddrs` of a given peer.

`peerStore.addressBook.set(peerId, multiaddrs)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to set |
| multiaddrs | |`Array<Multiaddr>` | [`Multiaddrs`][multiaddr] to store |

#### Returns

| Type | Description |
|------|-------------|
| `AddressBook` | Returns the Address Book component |

#### Example

```js
peerStore.addressBook.add(peerId, multiaddr)
```

### peerStore.protoBook.add

Add known `protocols` of a given peer.

`peerStore.protoBook.add(peerId, protocols)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to set |
| protocols | `Array<string>` | protocols to add |

#### Returns

| Type | Description |
|------|-------------|
| `ProtoBook` | Returns the Proto Book component |

#### Example

```js
peerStore.protoBook.add(peerId, protocols)
```

### peerStore.protoBook.delete

Delete the provided peer from the book.

`peerStore.protoBook.delete(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to remove |

#### Returns

| Type | Description |
|------|-------------|
| `boolean` | true if found and removed |

#### Example

```js
peerStore.protoBook.delete(peerId)
// false
peerStore.protoBook.set(peerId, protocols)
peerStore.protoBook.delete(peerId)
// true
```

### peerStore.protoBook.get

Get the known `protocols` of a provided peer.

`peerStore.protoBook.get(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to get |

#### Returns

| Type | Description |
|------|-------------|
| `Array<string>` | Array of peer's supported protocols |

#### Example

```js
peerStore.protoBook.get(peerId)
// undefined
peerStore.protoBook.set(peerId, [ '/proto/1.0.0', '/proto/1.1.0' ])
peerStore.protoBook.get(peerId)
// [ '/proto/1.0.0', '/proto/1.1.0' ]
```

### peerStore.protoBook.set

Set known `protocols` of a given peer.

`peerStore.protoBook.set(peerId, protocols)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to set |
| protocols | `Array<string>` | protocols to store |

#### Returns

| Type | Description |
|------|-------------|
| `ProtoBook` | Returns the Proto Book component |

#### Example

```js
peerStore.protoBook.set(peerId, protocols)
```

### peerStore.delete

Delete the provided peer from every book.

`peerStore.delete(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to remove |

#### Returns

| Type | Description |
|------|-------------|
| `boolean` | true if found and removed |

#### Example

```js
peerStore.delete(peerId)
// false
peerStore.addressBook.set(peerId, multiaddrs)
peerStore.protoBook.set(peerId, protocols)
peerStore.delete(peerId)
// true
peerStore.delete(peerId2)
// false
peerStore.addressBook.set(peerId2, multiaddrs)
peerStore.delete(peerId2)
// true
```

### peerStore.get

Get the stored information of a given peer.

`peerStore.get(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | peerId to get |

#### Returns

| Type | Description |
|------|-------------|
| [`PeerInfo`][peer-info] | Peer information of the provided peer |

TODO: change when `peer-info` is deprecated to new pointer

#### Example

```js
peerStore.get(peerId)
// false
peerStore.addressBook.set(peerId, multiaddrs)
peerStore.protoBook.set(peerId, protocols)
peerStore.get(peerId)
// {
//   MultiaddrInfos: [...],
//   protocols: [...]
// }
```

### peerStore.peers

Get all the stored information of every peer.

`peerStore.peers`

#### Returns

| Type | Description |
|------|-------------|
| `Map<string, PeerInfo>` | Peer information of every peer |

TODO: change when `peer-info` is deprecated to new pointer (breaking change)

#### Example

```js
for (let [peerIdString, peerInfo] of peerStore.peers.entries()) {
  // peerInfo instance
}
```

### pubsub.getSubscribers

Gets a list of the peer-ids that are subscribed to one topic.

`libp2p.pubsub.getSubscribers(topic)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| topic | `string` | topic to publish |

#### Returns

| Type | Description |
|------|-------------|
| `Array<string>` | peer-id subscribed to the topic |

#### Example

```js
const peerIds = libp2p.pubsub.getSubscribers(topic)
```

### pubsub.getTopics

Gets a list of topics the node is subscribed to.

`libp2p.pubsub.getTopics()`

#### Returns

| Type | Description |
|------|-------------|
| `Array<string>` | topics the node is subscribed to |

#### Example

```js
const topics = libp2p.pubsub.getTopics()
```

### pubsub.publish

Publishes messages to the given topics.

`libp2p.pubsub.publish(topic, data)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| topic | `string` | topic to publish |
| data | `Buffer` | data to publish  |

#### Returns

| Type | Description |
|------|-------------|
| `Promise` | publish success |

#### Example

```js
const topic = 'topic'
const data = Buffer.from('data')

await libp2p.pubsub.publish(topic, data)
```

### pubsub.subscribe

Subscribes the given handler to a pubsub topic.

`libp2p.pubsub.subscribe(topic, handler)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| topic | `string` | topic to subscribe |
| handler | `function({ from: string, data: Buffer, seqno: Buffer, topicIDs: Array<string>, signature: Buffer, key: Buffer })` | handler for new data on topic |

#### Returns

| Type | Description |
|------|-------------|
| `void` |  |

#### Example

```js
const topic = 'topic'
const handler = (msg) => {
  // msg.data - pubsub data received
}

libp2p.pubsub.subscribe(topic, handler)
```

### pubsub.unsubscribe

Unsubscribes the given handler from a pubsub topic. If no handler is provided, all handlers for the topic are removed.

`libp2p.pubsub.unsubscribe(topic, handler)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| topic | `string` | topic to unsubscribe |
| handler | `function(<object>)` | handler subscribed |

#### Returns

| Type | Description |
|------|-------------|
| `void` |  |

#### Example

```js
const topic = 'topic'
const handler = (msg) => {
  // msg.data - pubsub data received
}

libp2p.pubsub.unsubscribe(topic, handler)
```

### connectionManager.setPeerValue

Enables users to change the value of certain peers in a range of 0 to 1. Peers with the lowest values will have their Connections pruned first, if any Connection Manager limits are exceeded. See [./CONFIGURATION.md#configuring-connection-manager](./CONFIGURATION.md#configuring-connection-manager) for details on how to configure these limits.

`libp2p.connectionManager.setPeerValue(peerId, value)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | The peer to set the value for |
| value | `number` | The value of the peer from 0 to 1 |

#### Returns

| Type | Description |
|------|-------------|
| `void` |  |

#### Example

```js
libp2p.connectionManager.setPeerValue(highPriorityPeerId, 1)
libp2p.connectionManager.setPeerValue(lowPriorityPeerId, 0)
```

### metrics.global

A [`Stats`](#stats) object of tracking the global bandwidth of the libp2p node.

#### Example

```js
const peerIdStrings = libp2p.metrics.peers
```

### metrics.peers

An array of [`PeerId`][peer-id] strings of each peer currently being tracked.

#### Example

```js
const peerIdStrings = libp2p.metrics.peers
```

### metrics.protocols

An array of protocol strings that are currently being tracked.

#### Example

```js
const protocols = libp2p.metrics.protocols
```

### metrics.forPeer

Returns the [`Stats`](#stats) object for a given [`PeerId`][peer-id] if it is being tracked.

`libp2p.metrics.forPeer(peerId)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | [`PeerId`][peer-id] | The peer to get stats for |

#### Returns

| Type | Description |
|------|-------------|
| [`Stats`](#stats) | The bandwidth stats of the peer |

#### Example

```js
const peerStats = libp2p.metrics.forPeer(peerInfo)
console.log(peerStats.toJSON())
```

### metrics.forProtocol

Returns the [`Stats`](#stats) object for a given protocol if it is being tracked.

`libp2p.metrics.forProtocol(protocol)`

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| protocol | `string` | The protocol to get stats for |

#### Returns

| Type | Description |
|------|-------------|
| [`Stats`](#stats) | The bandwidth stats of the protocol across all peers |

#### Example

```js
const peerStats = libp2p.metrics.forProtocol('/meshsub/1.0.0')
console.log(peerStats.toJSON())
```

## Events

Once you have a libp2p instance, you can listen to several events it emits, so that you can be notified of relevant network events.

#### An error has occurred

`libp2p.on('error', (err) => {})`

- `err`: instance of `Error`

#### A peer has been discovered

`libp2p.on('peer:discovery', (peer) => {})`

If `autoDial` option is `true`, applications should **not** attempt to connect to the peer
unless they are performing a specific action. See [peer discovery and auto dial](./PEER_DISCOVERY.md) for more information.

- `peer`: instance of [`PeerInfo`][peer-info]

#### A new connection to a peer has been opened

This event will be triggered anytime a new Connection is established to another peer.

`libp2p.on('peer:connect', (peer) => {})`

- `peer`: instance of [`PeerInfo`][peer-info]

#### An existing connection to a peer has been closed

This event will be triggered anytime we are disconnected from another peer, regardless of the circumstances of that disconnection. If we happen to have multiple connections to a peer, this event will **only** be triggered when the last connection is closed.

`libp2p.on('peer:disconnect', (peer) => {})`

- `peer`: instance of [`PeerInfo`][peer-info]

## Types

### Stats

- `Stats`
  - `toJSON<function()>`: Returns a JSON snapshot of the stats.
    - `dataReceived<string>`: The stringified value of total incoming data for this stat.
    - `dataSent<string>`: The stringified value of total outgoing data for this stat.
    - `movingAverages<object>`: The properties are dependent on the configuration of the moving averages interval. Defaults are listed here.
      - `['60000']<number>`: The calculated moving average at a 1 minute interval.
      - `['300000']<number>`: The calculated moving average at a 5 minute interval.
      - `['900000']<number>`: The calculated moving average at a 15 minute interval.
  - `snapshot<object>`: A getter that returns a clone of the raw stats.
    - `dataReceived<BigNumber>`: A [`BigNumber`](https://github.com/MikeMcl/bignumber.js/) of the amount of incoming data
    - `dataSent<BigNumber>`: A [`BigNumber`](https://github.com/MikeMcl/bignumber.js/) of the amount of outgoing data
  - `movingAverages<object>`: A getter that returns a clone of the raw [moving averages](https://www.npmjs.com/package/moving-averages) stats. **Note**: The properties of this are dependent on configuration. The defaults are shown here.
    - `['60000']<MovingAverage>`: The [MovingAverage](https://www.npmjs.com/package/moving-averages) at a 1 minute interval.
    - `['300000']<MovingAverage>`: The [MovingAverage](https://www.npmjs.com/package/moving-averages) at a 5 minute interval.
    - `['900000']<MovingAverage>`: The [MovingAverage](https://www.npmjs.com/package/moving-averages) at a 15 minute interval.

[multiaddr-info]: https://github.com/libp2p/js-libp2p/tree/master/src/peer-store/address-book.js
[cid]: https://github.com/multiformats/js-cid
[connection]: https://github.com/libp2p/js-interfaces/tree/master/src/connection
[multiaddr]: https://github.com/multiformats/js-multiaddr
[peer-id]: https://github.com/libp2p/js-peer-id
[peer-info]: https://github.com/libp2p/js-peer-info
