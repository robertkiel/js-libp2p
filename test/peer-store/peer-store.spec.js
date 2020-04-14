'use strict'
/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const { expect } = chai

const PeerStore = require('../../src/peer-store')
const multiaddr = require('multiaddr')

const peerUtils = require('../utils/creators/peer')

const addr1 = multiaddr('/ip4/127.0.0.1/tcp/8000')
const addr2 = multiaddr('/ip4/127.0.0.1/tcp/8001')
const addr3 = multiaddr('/ip4/127.0.0.1/tcp/8002')
const addr4 = multiaddr('/ip4/127.0.0.1/tcp/8003')

const proto1 = '/protocol1'
const proto2 = '/protocol2'
const proto3 = '/protocol3'

describe('peer-store', () => {
  let peerIds
  before(async () => {
    peerIds = await peerUtils.createPeerId({
      number: 4
    })
  })

  describe('empty books', () => {
    let peerStore

    beforeEach(() => {
      peerStore = new PeerStore()
    })

    it('has an empty map of peers', () => {
      const peers = peerStore.peers
      expect(peers.size).to.equal(0)
    })

    it('returns false on trying to delete a non existant peerId', () => {
      const deleted = peerStore.delete(peerIds[0])
      expect(deleted).to.equal(false)
    })

    it('returns undefined on trying to find a non existant peerId', () => {
      const peerInfo = peerStore.get(peerIds[0])
      expect(peerInfo).to.not.exist()
    })
  })

  describe('previously populated books', () => {
    let peerStore

    beforeEach(() => {
      peerStore = new PeerStore()

      // Add peer0 with { addr1, addr2 } and { proto1 }
      peerStore.addressBook.set(peerIds[0], [addr1, addr2])
      peerStore.protoBook.set(peerIds[0], [proto1])

      // Add peer1 with { addr3 } and { proto2, proto3 }
      peerStore.addressBook.set(peerIds[1], [addr3])
      peerStore.protoBook.set(peerIds[1], [proto2, proto3])

      // Add peer2 with { addr4 }
      peerStore.addressBook.set(peerIds[2], [addr4])

      // Add peer3 with { addr4 } and { proto2 }
      peerStore.addressBook.set(peerIds[3], [addr4])
      peerStore.protoBook.set(peerIds[3], [proto2])
    })

    it('has peers', () => {
      const peers = peerStore.peers

      expect(peers.size).to.equal(4)
      expect(Array.from(peers.keys())).to.have.members([
        peerIds[0].toB58String(),
        peerIds[1].toB58String(),
        peerIds[2].toB58String(),
        peerIds[3].toB58String()
      ])
    })

    it('returns true on deleting a stored peer', () => {
      const deleted = peerStore.delete(peerIds[0])
      expect(deleted).to.equal(true)

      const peers = peerStore.peers
      expect(peers.size).to.equal(3)
      expect(Array.from(peers.keys())).to.not.have.members([peerIds[0].toB58String()])
    })

    it('returns true on deleting a stored peer which is only on one book', () => {
      const deleted = peerStore.delete(peerIds[2])
      expect(deleted).to.equal(true)

      const peers = peerStore.peers
      expect(peers.size).to.equal(3)
    })

    it('gets the stored information of a peer in all its books', () => {
      const peerInfo = peerStore.get(peerIds[0])
      expect(peerInfo).to.exist()
      expect(peerInfo.protocols).to.have.members([proto1])

      const peerMultiaddrs = peerInfo.multiaddrInfos.map((mi) => mi.multiaddr)
      expect(peerMultiaddrs).to.have.members([addr1, addr2])
    })

    it('gets the stored information of a peer that is not present in all its books', () => {
      const peerInfo = peerStore.get(peerIds[2])
      expect(peerInfo).to.exist()
      expect(peerInfo.protocols.length).to.eql(0)

      const peerMultiaddrs = peerInfo.multiaddrInfos.map((mi) => mi.multiaddr)
      expect(peerMultiaddrs).to.have.members([addr4])
    })

    it('can find all the peers supporting a protocol', () => {
      const peerSupporting2 = []

      for (const [, peerInfo] of peerStore.peers.entries()) {
        if (peerInfo.protocols.includes(proto2)) {
          peerSupporting2.push(peerInfo)
        }
      }

      expect(peerSupporting2.length).to.eql(2)
      expect(peerSupporting2[0].id.toB58String()).to.eql(peerIds[1].toB58String())
      expect(peerSupporting2[1].id.toB58String()).to.eql(peerIds[3].toB58String())
    })

    it('can find all the peers listening on a given address', () => {
      const peerListenint4 = []

      for (const [, peerInfo] of peerStore.peers.entries()) {
        const multiaddrs = peerInfo.multiaddrInfos.map((mi) => mi.multiaddr)

        if (multiaddrs.includes(addr4)) {
          peerListenint4.push(peerInfo)
        }
      }

      expect(peerListenint4.length).to.eql(2)
      expect(peerListenint4[0].id.toB58String()).to.eql(peerIds[2].toB58String())
      expect(peerListenint4[1].id.toB58String()).to.eql(peerIds[3].toB58String())
    })
  })
})
