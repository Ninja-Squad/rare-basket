# HTTP API Documentation

Event though all the backend consists in HTTP services, those services have primarily been designed to fulfill the 
specific needs of the frontend UI, and everything should generally be done from the UI.

However, some of the HTTP endpoints can be used directly from other applications which need to create baskets, 
in a similar way as RARe.

These endpoints are described here.

## Create a new basket

Creating a new basket can be done by sending an HTTP POST request to the path `<base-url>/api/baskets`, with 
the following JSON object as body:

| Property                     | Description                                                              |
|------------------------------|--------------------------------------------------------------------------|
| items                        | An array of basket items (not empty)                                     |
| items[].accession            | An accession object                                                      |
| items[].accession.name       | The name of the accession (not blank)                                    |
| items[].accession.identifier | The identifier of the accession (not blank)                              |
| items[].accessionHolder      | The name of the accession holder in charge of this accession (not blank) |
| items[].quantity             | The quantity (integer, optional)                                         |
| items[].unit                 | The unit of the quantity (optional)                                      |
| rationale                    | The rationale/description of the order (optional)                        |
| complete                     | Is the information complete (optional, default false)                    |
| customer                     | The customer information (optional, unless complete is true)             |
| customer.name                | The name of the customer (optional, unless complete is true)             |
| customer.organization        | The organization/company of the customer (optional)                      |
| customer.email               | The email of the customer (optional, unless complete is true)            |
| customer.deliveryAddress     | The delivery address of the customer (optional, unless complete is true) |
| customer.billingAddress      | The billing address of the customer (optional, unless complete is true)  |
| customer.type                | The type of the customer (optional, unless complete is true)             |
| customer.language            | The language of the customer (optional, unless complete is true).        |

The valid values of `customer.type` are 

 - INRAE_RESEARCHER,
 - FR_RESEARCHER,
 - FOREIGN_RESEARCHER,
 - FR_COMPANY,
 - FOREIGN_COMPANY,
 - FARMER,
 - NGO,
 - CITIZEN,
 - OTHER
 
The valid values of `customer.language` are 

 - fr,
 - en 
 
If the `complete` property is omitted or false, then all the customer-related information is optional.
The basket will be created with the status `DRAFT`. This means that the application will have to do the same as RARe:
send the customer to the URL or RARe-basket allowing the customer to complete the basket.
The customer will then be able to complete the customer information, then receive a confirmation email and finally 
confirm the order.

If the `complete` property is true, then all the customer-related information must be present and valid.
The basket will be created with the status `SAVED`. 
The customer won't have to complete the customer information, but he/she will receive a confirmation email and be 
allowed to confirm the order.

The response to this request, in all cases, is a JSON object containing the information about the basket that has
just been created. The structure of the response is the following:

| Property                                              | Description                                                   |
|-------------------------------------------------------|---------------------------------------------------------------|
| id                                                    | The technical ID of the basket (number)                       |
| reference                                             | The functional identifier of the basket (8 characters string) |
| status                                                | The status of the basket (DRAFT or SAVED                      |
| rationale                                             | The rationale/description of the order (optional)             |
| accessionHolderBaskets                                | An array of "sub-baskets", one by accession holder involved   |
| accessionHolderBaskets[].accessionHolderName          | The name of the accession holder                              |
| accessionHolderBaskets[].grcName                      | The name of the GRC of the  accession holder                  |
| accessionHolderBaskets[].items                        | The basket items for this accession holder                    |
| accessionHolderBaskets[].items[].id                   | The technical ID of the item (number)                         |
| accessionHolderBaskets[].items[].accession.name       | The name of the accession                                     |
| accessionHolderBaskets[].items[].accession.identifier | The identifier of the accession                               |
| accessionHolderBaskets[].items[].quantity             | The quantity (number or null)                                 |
| accessionHolderBaskets[].items[].unit                 | The unit of the quantity (or null)                            |
| customer                     | The customer information (or null)                                                     |
| customer.name                | The name of the customer (or null)                                                     |
| customer.organization        | The organization/company of the customer (or null)                                     |
| customer.email               | The email of the customer (or null)                                                    |
| customer.deliveryAddress     | The delivery address of the customer (or null)                                         |
| customer.billingAddress      | The billing address of the customer (or null)                                          |
| customer.type                | The type of the customer (or null)                                                     |
| customer.language            | The language of the customer (or null)                                                 |

The reference is the most important part of this response. It's what you need to extract from the response in order to 
send the customer to the page allowing to complete the order (if `complete` is not true), using the following URL:
`<base-url>/baskets/<reference>`.

Note that this reference should be kept secret (except to the customer who is at the origin of the request), since
it allows accessing the details of the basket, including its customer information.

## Get a basket by reference

In case the application needs to get the information about a basket it has previously created, it can send a GET request
to `<base-url>/api/baskets/<reference>`. 

The response contains the same JSON body as the response to the POST request described above.

## Update a basket

Finally, while the basket has the DRAFT status, it's possible to update it by sending a PUT request to
`<base-url>/api/baskets/<reference>`. 

The request body is the same as in the `POST` request described above, and the validation rules and the behavior are 
similar (except that the basket is updated instead of being created, and thus keeps its ID and reference). 

The response is empty.
