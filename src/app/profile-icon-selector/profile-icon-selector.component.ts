import { Component, Provider, forwardRef } from '@angular/core';
import { profileIconNames } from './profile-icon-names';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const PROFILE_ICON_VALUE_PROVIDER: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ProfileIconSelectorComponent),
  multi: true,
}

@Component({
  selector: 'con-profile-icon-selector',
  templateUrl: './profile-icon-selector.component.html',
  styleUrls: ['./profile-icon-selector.component.css'],
  providers: [PROFILE_ICON_VALUE_PROVIDER]
})

export class ProfileIconSelectorComponent implements ControlValueAccessor {
  private onChange!: Function;
  private onTouched!: Function;

  writeValue(icon: string | null): void {
    this.currentIcon = icon;
    if (icon && icon !== '')
      this.showAllIcons = false;
    else
      this.showAllIcons = true;
  }

  registerOnChange(fn: Function): void {
    this.onChange = (icon: string) => { fn(icon); };
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }
  
  setDisabledState?(isDisabled: boolean): void {
  }

  profileIcons = profileIconNames;
  showAllIcons: boolean = true;
  currentIcon!: string | null;

  iconSelected(icon: string): void {
    this.showAllIcons = false;
    this.currentIcon = icon;
    this.onChange(icon);
  }
}
