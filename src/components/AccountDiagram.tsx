import { type ComponentType, Fragment, type ReactNode, type SVGProps } from 'react'
import CrownIcon from '~icons/lucide/crown'
import KeyIcon from '~icons/lucide/key'
import SlidersIcon from '~icons/lucide/sliders-horizontal'
import UserIcon from '~icons/lucide/user-round'
import WalletIcon from '~icons/lucide/wallet'
import { accountDiagram } from './AccountDiagram.styles'
import { docsIcons } from './DocsIcon'

/**
 * Icons the diagrams need beyond the shared docs set. `key` is a private key; access keys keep the
 * shared `accessKey` glyph.
 */
const extraIcons = {
  crown: CrownIcon,
  key: KeyIcon,
  sliders: SlidersIcon,
  user: UserIcon,
  wallet: WalletIcon,
}

type Glyph = keyof typeof docsIcons | keyof typeof extraIcons

const diagrams = {
  address: AccountAddress,
  signers: SignerApproval,
  'access-keys': AccessKeyBounds,
  'account-types': AccountTypes,
  'single-key': SingleKeyAccount,
  configurable: ConfigurableAccount,
  keychain: KeychainAuthority,
}

/**
 * Account diagrams, drawn in HTML so they wrap at phone width and follow the docs theme. They use
 * the Zone diagram's language: cards on the page, joined by drawn arrows or brackets. Diagrams hold
 * labels only; explanations belong in the page text. The figure is one image to assistive
 * technology; `alt` carries the full description, and the Markdown export renders `alt` in its
 * place.
 */
export function AccountDiagram({ name, alt }: { name: keyof typeof diagrams; alt: string }) {
  const Diagram = diagrams[name]
  return (
    <figure
      className={`account-diagram ${accountDiagram().className}`}
      data-diagram={name}
      role="img"
      aria-label={alt}
    >
      <div className="ad-canvas">
        <Diagram />
      </div>
    </figure>
  )
}

function Icon({ name }: { name: Glyph }) {
  const Svg: ComponentType<SVGProps<SVGSVGElement>> =
    name in extraIcons
      ? extraIcons[name as keyof typeof extraIcons]
      : docsIcons[name as keyof typeof docsIcons]
  return (
    <Svg
      className="ad-icon"
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      strokeWidth="1.75"
    />
  )
}

/** A card: an icon and a title, with an optional weight or threshold. */
function Node({
  icon,
  title,
  value,
  tone,
}: {
  icon: Glyph
  title: string
  value?: string
  tone?: 'strong'
}) {
  return (
    <span className={tone ? `ad-node ad-node-${tone}` : 'ad-node'}>
      <Icon name={icon} />
      <span className="ad-node-title">{title}</span>
      {value !== undefined && <span className="ad-value">{value}</span>}
    </span>
  )
}

/** A drawn arrow with its verb above and an optional note below. */
function Link({ label, note }: { label: string; note?: string }) {
  return (
    <span className="ad-link">
      <span className="ad-link-label">{label}</span>
      <span className="ad-link-line">
        <span className="ad-link-rule" />
        <svg
          className="ad-link-head"
          viewBox="0 0 6 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M1 1l4 4-4 4" />
        </svg>
      </span>
      <span className="ad-link-note">{note}</span>
    </span>
  )
}

/** Rows of `from → to` on one grid, so arrows and cards line up across rows. */
function Flow({ rows }: { rows: ReadonlyArray<readonly [ReactNode, ReactNode, ReactNode]> }) {
  return (
    <div className="ad-flow">
      {rows.map(([from, link, to], index) => (
        <Fragment key={index}>
          <span className="ad-flow-from">{from}</span>
          {link}
          <span className="ad-flow-to">{to}</span>
        </Fragment>
      ))}
    </div>
  )
}

/** Short labels for what a card has. */
function Tags({ items }: { items: ReadonlyArray<string> }) {
  return (
    <span className="ad-tags">
      {items.map((item) => (
        <span key={item} className="ad-tag">
          {item}
        </span>
      ))}
    </span>
  )
}

/** A titled card holding tags. */
function Panel({
  icon,
  title,
  tone,
  children,
}: {
  icon: Glyph
  title: string
  tone?: 'quiet'
  children: ReactNode
}) {
  return (
    <div className={tone ? `ad-panel ad-panel-${tone}` : 'ad-panel'}>
      <div className="ad-panel-head">
        <Icon name={icon} />
        {title}
      </div>
      {children}
    </div>
  )
}

/** Equal columns joined by a bracket into one card below, or split from one card above. */
function Fork({
  top,
  bottom,
  direction,
}: {
  top: ReactNode
  bottom: ReactNode
  direction: 'join' | 'split'
}) {
  return (
    <div className={`ad-fork ad-fork-${direction}`}>
      <div className="ad-fork-top">{top}</div>
      <span className="ad-fork-bracket" aria-hidden="true" />
      <div className="ad-fork-bottom">{bottom}</div>
    </div>
  )
}

function AccountAddress() {
  return (
    <Fork
      direction="split"
      top={<Node icon="document" title="Address" tone="strong" />}
      bottom={
        <>
          <Node icon="user" title="Single-key account" />
          <span className="ad-or">or</span>
          <Node icon="sliders" title="Configurable account" />
        </>
      }
    />
  )
}

function SignerApproval() {
  return (
    <Fork
      direction="join"
      top={
        <>
          <Node icon="passkey" title="Passkey" value="2" />
          <Node icon="key" title="Backup key" value="1" />
          <Node icon="key" title="Recovery key" value="1" />
        </>
      }
      bottom={<Node icon="threshold" title="Threshold" value="2" tone="strong" />}
    />
  )
}

function AccessKeyBounds() {
  return (
    <div className="ad-panels">
      <Panel icon="accessKey" title="Access key">
        <Tags items={['Spending limit', 'Expiry', 'Scopes']} />
      </Panel>
      <Panel icon="crown" title="Admin access key" tone="quiet">
        <Tags items={['No limits']} />
      </Panel>
    </div>
  )
}

function AccountTypes() {
  return (
    <div className="ad-stack ad-stack-shared">
      <Flow
        rows={[
          [
            <Node key="from" icon="user" title="Single-key account" />,
            <Link key="link" label="upgrade" note="same address" />,
            <Node key="to" icon="sliders" title="Configurable account" />,
          ],
        ]}
      />
      <Node icon="rules" title="Account Keychain" />
    </div>
  )
}

function SingleKeyAccount() {
  return (
    <div className="ad-fan">
      <Node icon="key" title="Private key" tone="strong" />
      <span className="ad-fan-stem" aria-hidden="true" />
      <div className="ad-fan-branches">
        <Link label="derives" />
        <Node icon="document" title="Address" />
        <Link label="authorizes" />
        <Node icon="accessKey" title="Access keys" />
      </div>
    </div>
  )
}

function ConfigurableAccount() {
  return (
    <Flow
      rows={[
        [
          <Node key="from" icon="sliders" title="Signers, threshold, salt" />,
          <Link key="link" label="derive" />,
          <Node key="to" icon="document" title="Address" tone="strong" />,
        ],
        [
          <Node key="from" icon="team" title="Signer approvals" />,
          <Link key="link" label="reach the threshold" />,
          <Node key="to" icon="approved" title="Transaction runs" tone="strong" />,
        ],
      ]}
    />
  )
}

function KeychainAuthority() {
  return (
    <div className="ad-chain">
      <Node icon="wallet" title="Account" />
      <span className="ad-then">
        <Link label="authorizes" />
        <Node icon="accessKey" title="Access key" tone="strong" />
      </span>
      <span className="ad-then">
        <Link label="signs within" />
        <Tags items={['Spending limit', 'Expiry', 'Scopes']} />
      </span>
    </div>
  )
}
