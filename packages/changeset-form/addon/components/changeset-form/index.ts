import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { BufferedChangeset } from 'ember-changeset/types';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

interface ChangesetFormArgs {
  /** Changeset Object */
  changeset: BufferedChangeset;

  /**
   * Run Changeset execute method instead of save
   * @defaultValue false
   * */
  runExecuteInsteadOfSave?: boolean;

  /**
   * Always show errors if there are any
   * @defaultValue false
   */
  alwaysShowErrors?: boolean;

  /**
   * Validate the changeset on initialization
   * @defaultValue false
   */
  validateOnInit?: boolean;

  /**
   * Skip running execute AND save. Useful for immutable source objects.
   * Will also return the whole changeset to onSubmit instead of the
   * executed result.
   * @defaultValue false
   */
  skipExecution?: boolean;

  /** Callback exeuted when from `onsubmit` event is triggered */
  onSubmit?: (data: unknown, event: Event) => void;

  /** Callback exeuted when from `onreset` event is triggered */
  onReset?: (data: unknown, event: Event) => void;
}

export default class ChangesetForm extends Component<ChangesetFormArgs> {
  @tracked hasSubmitted = false;

  constructor(owner: unknown, args: ChangesetFormArgs) {
    super(owner, args);
    assert(
      '@changeset must be defined on <ChangesetForm> component',
      this.args.changeset
    );

    if (this.args.validateOnInit) {
      this.args.changeset.validate();
    }
  }

  @action
  async handleSubmit(
    changeset: BufferedChangeset,
    event: Event
  ): Promise<void> {
    event.preventDefault();
    await changeset.validate();

    this.hasSubmitted = true;

    if (changeset.isInvalid) {
      return;
    }

    let result;
    if (this.args.skipExecution) {
      result = changeset;
    } else {
      if (this.args.runExecuteInsteadOfSave) {
        result = changeset.execute();
      } else {
        result = await changeset.save({});
      }
      result = result.data;
    }

    if (typeof this.args.onSubmit === 'function') {
      this.args.onSubmit(result, event);
    }
  }

  @action
  handleReset(changeset: BufferedChangeset, event: Event): void {
    event.preventDefault();
    this.hasSubmitted = false;

    const { data } = changeset.rollback();
    if (typeof this.args.onReset === 'function') {
      this.args.onReset(data, event);
    }
  }
}
