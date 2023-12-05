import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { addressTypeValues, phoneTypeValues } from '../contacts/contact.model';
import { restrictedWordsValidator } from '../validators/restricted-words.validator';
@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {
  addressTypes = addressTypeValues;
  phoneTypes = phoneTypeValues;

  // firstName = new FormControl('scot'); // can set init value this way
  contactForm = this.fb.nonNullable.group({
    id: '',
    personal: false,
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: '',
    dateOfBirth: <Date|null> null,
    favoritesRanking: <number|null> null,
    phone: this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
    }),
    address: this.fb.nonNullable.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressType: '',
    }),
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
      if (!contact)
        return;

      // use when we want to initialize all form controls
      this.contactForm.setValue(contact);

      // use this method to just init a subset of the total form controls
      // const justNames = { firstName: contact.firstName, lastName: contact.lastName };
      // this.contactForm.patchValue(justNames);
    });
  }

  saveContact() {
    console.log(this.contactForm.value.dateOfBirth, typeof this.contactForm.value.dateOfBirth);
    //console.log(this.contactForm.controls.phone.controls.phoneType.value);
    this.contactsService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    })
  }
}
