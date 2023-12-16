import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { addressTypeValues, phoneTypeValues } from '../contacts/contact.model';
import { restrictedWordsValidator } from '../validators/restricted-words.validator';
import { debounceTime, distinctUntilChanged } from 'rxjs';
@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {
  addressTypes = addressTypeValues;
  phoneTypes = phoneTypeValues;

  // firstName = new FormControl('scot'); // can set init value this way
  contactForm = this.fb.nonNullable.group({
    icon: '',
    id: '',
    personal: false,
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: '',
    dateOfBirth: <Date | null>null,
    favoritesRanking: <number | null>null,
    phones: this.fb.array([this.createPhoneGroup()]),
    addresses: this.fb.array([this.createAddressGroup()]),
    notes: ['', restrictedWordsValidator(['crap', 'crud'])],
  });

  get firstName() {
    return this.contactForm.controls.firstName;
  }

  get notes() {
    return this.contactForm.controls.notes;
  }

  constructor(private route: ActivatedRoute,
    private contactsService: ContactsService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) return;

    this.contactsService.getContact(contactId).subscribe(contact => {
      if (!contact) {
        this.subscribeToAddressChanges();
        return;
      }

      for (let i = 1; i < contact.addresses.length; i++)
        this.addAddress();
      for (let i = 1; i < contact.phones.length; i++)
        this.addPhone();

      // use when we want to initialize all form controls
      this.contactForm.setValue(contact);
      this.subscribeToAddressChanges();

      // use this method to just init a subset of the total form controls
      // const justNames = { firstName: contact.firstName, lastName: contact.lastName };
      // this.contactForm.patchValue(justNames);
    });
  }

  addAddress() {
    this.contactForm.controls.addresses.push(this.createAddressGroup());
  }

  addPhone() {
    this.contactForm.controls.phones.push(this.createPhoneGroup());
  }

  createAddressGroup() {
    return this.fb.nonNullable.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressType: '',
    });
  }

  createPhoneGroup() {
    const phoneGroup = this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
      preferred: false,
    });

    phoneGroup.controls.preferred.valueChanges
      .pipe(distinctUntilChanged(this.stringifyCompare))
      .subscribe(value => {
        if (value)
          phoneGroup.controls.phoneNumber.addValidators([Validators.required]);
        else
          phoneGroup.controls.phoneNumber.removeValidators([Validators.required]);   //.clearValidators();

        phoneGroup.controls.phoneNumber.updateValueAndValidity();
      });

    return phoneGroup;
  }

  saveContact() {
    console.log(this.contactForm.value.dateOfBirth, typeof this.contactForm.value.dateOfBirth);
    //console.log(this.contactForm.controls.phone.controls.phoneType.value);
    this.contactsService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    })
  }

  stringifyCompare(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  subscribeToAddressChanges() {
    for (let i = 0; i < this.contactForm.controls.addresses.length; i++){
      let addressGroup = this.contactForm.controls.addresses.controls[i];
      addressGroup.valueChanges
        .pipe(distinctUntilChanged(this.stringifyCompare))
        .subscribe(() => {
          for (const controlName in addressGroup.controls) {
            addressGroup.get(controlName)?.removeValidators([Validators.required]);
            addressGroup.get(controlName)?.updateValueAndValidity();
          }
        });

      addressGroup.valueChanges
        .pipe(debounceTime(2000), distinctUntilChanged(this.stringifyCompare))
        .subscribe(() => {
          for (const controlName in addressGroup.controls) {
            addressGroup.get(controlName)?.addValidators([Validators.required]);
            addressGroup.get(controlName)?.updateValueAndValidity();
          }
        });
    }
  }
}
